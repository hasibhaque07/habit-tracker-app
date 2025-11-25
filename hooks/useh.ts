import { getDateInfo } from "@/utils/dateUtils";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";

export interface WeeklyHeatmapRawRow {
  id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  created_at: string;
  frequency: string;
  target?: number | null;
  active: number;
  order: number;
  week_start?: string | null;
  statuses?: string | null;
}

export interface WeeklyHeatmapResult {
  id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  created_at: string;
  frequency: string;
  target?: number | null;
  active: number;
  order: number;
  week_start: string;
  statuses: (0 | 1 | null)[];
}

export function useHeatmapWeekly() {
  const db = useSQLiteContext();

  const { data, isLoading, error, refetch } = useQuery<WeeklyHeatmapResult[]>({
    queryKey: ["heatmap-weekly"],
    queryFn: async () => {
      const t = getDateInfo();

      const rows = await db.getAllAsync<WeeklyHeatmapRawRow>(
        `
          SELECT
            h.*,
            hh.week_start,
            hh.statuses
          FROM habits h
          LEFT JOIN habit_heatmap hh
            ON hh.habit_id = h.id
            AND hh.week_start = ?
          WHERE h.active = 1
          ORDER BY h."order" ASC;
        `,
        [t.weekStart]
      );

      return rows.map<WeeklyHeatmapResult>((row) => {
        if (row.week_start && row.statuses) {
          return {
            ...row,
            week_start: row.week_start,
            statuses: JSON.parse(row.statuses),
          };
        }

        return {
          ...row,
          week_start: t.weekStart,
          statuses: Array(7).fill(null),
        };
      });
    },
  });

  return {
    weeklyData: data || [],
    isLoading,
    error,
    refetch,
  };
}
