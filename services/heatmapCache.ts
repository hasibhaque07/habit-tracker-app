import { useSQLiteContext } from "expo-sqlite";
import { DateTime } from "luxon";

export type DB = ReturnType<typeof useSQLiteContext>;

export function getWeekStartIso(dateIso: string): string {
  return DateTime.fromISO(dateIso).startOf("week").toFormat("yyyy-MM-dd");
}

export async function buildWeekStatuses(
  db: DB,
  habitId: number,
  weekStartIso: string
) {
  const weekStart = DateTime.fromISO(weekStartIso);
  const weekEndIso = weekStart.plus({ days: 6 }).toFormat("yyyy-MM-dd");

  const entries = await db.getAllAsync<{ date: string; status: 0 | 1 }>(
    `SELECT date, status FROM habits_entry WHERE habit_id=? AND date BETWEEN ? AND ?`,
    [habitId, weekStartIso, weekEndIso]
  );

  const map = new Map<string, 0 | 1>();
  entries.forEach((e) => map.set(e.date, e.status));

  const statuses: (0 | 1 | null)[] = [];
  for (let i = 0; i < 7; i++) {
    const day = weekStart.plus({ days: i }).toFormat("yyyy-MM-dd");
    statuses.push(map.has(day) ? map.get(day)! : null);
  }

  return statuses;
}

export async function upsertHeatmapRange(
  db: DB,
  habitId: number,
  fromWeek: string,
  toWeek: string
) {
  let cursor = DateTime.fromISO(fromWeek);
  const end = DateTime.fromISO(toWeek);

  while (cursor <= end) {
    const ws = cursor.toFormat("yyyy-MM-dd");
    const statuses = await buildWeekStatuses(db, habitId, ws);

    await db.runAsync(
      `INSERT OR REPLACE INTO habit_heatmap(habit_id, week_start, statuses, updated_at)
       VALUES (?, ?, ?, ?)`,
      [habitId, ws, JSON.stringify(statuses), DateTime.local().toISO() ?? ""]
    );

    cursor = cursor.plus({ days: 7 });
  }
}

export async function updateHeatmapForHabit(db: DB, habitId: number) {
  const currentWeek = getWeekStartIso(DateTime.local().toISO()!);

  const cached = await db.getFirstAsync<{ week_start: string }>(
    `SELECT week_start FROM habit_heatmap WHERE habit_id=? ORDER BY week_start DESC LIMIT 1`,
    [habitId]
  );

  let startWeek = cached?.week_start;
  if (!startWeek) {
    const habitRow = await db.getFirstAsync<{ created_at: string }>(
      `SELECT created_at FROM habits WHERE id=? LIMIT 1`,
      [habitId]
    );
    startWeek = habitRow
      ? getWeekStartIso(habitRow.created_at)
      : DateTime.local()
          .minus({ weeks: 52 })
          .startOf("week")
          .toFormat("yyyy-MM-dd");
  }

  await upsertHeatmapRange(db, habitId, startWeek, currentWeek);
}

export async function rebuildAllHeatmaps(db: DB) {
  const habits = await db.getAllAsync<{ id: number }>(
    `SELECT id FROM habits WHERE active=1`
  );
  for (const h of habits) await updateHeatmapForHabit(db, h.id);
}
