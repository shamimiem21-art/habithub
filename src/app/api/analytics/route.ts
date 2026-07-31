import { NextResponse } from "next/server";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Missing userId" }, { status: 401 });
    }

    const habits = await db.habit.findMany({
      where: { userId, archived: false },
    });

    const logs = await db.habitLog.findMany({
      where: { userId },
    });

    const today = new Date();

    // 1. Daily trend (Last 14 days)
    const last14Days = eachDayOfInterval({ start: subDays(today, 13), end: today });
    const dailyChart = last14Days.map((d) => {
      const dateStr = format(d, "yyyy-MM-dd");
      const label = format(d, "MMM dd");
      const dayLogs = logs.filter((l) => l.date === dateStr);
      const completed = dayLogs.filter((l) => l.completed).length;
      const total = habits.length || 1;
      const rate = Math.round((completed / total) * 100);
      return { date: dateStr, label, completed, total, rate };
    });

    // 2. Calendar Heatmap (Last 90 days)
    const last90Days = eachDayOfInterval({ start: subDays(today, 89), end: today });
    const heatmap = last90Days.map((d) => {
      const dateStr = format(d, "yyyy-MM-dd");
      const dayLogs = logs.filter((l) => l.date === dateStr);
      const completed = dayLogs.filter((l) => l.completed).length;
      return {
        date: dateStr,
        count: completed,
        level: completed === 0 ? 0 : completed < 2 ? 1 : completed < 4 ? 2 : 3,
      };
    });

    // 3. Category performance
    const categoryMap: Record<string, { category: string; completed: number; total: number }> = {};
    logs.forEach((log) => {
      const habit = habits.find((h) => h.id === log.habitId);
      if (habit) {
        if (!categoryMap[habit.category]) {
          categoryMap[habit.category] = { category: habit.category, completed: 0, total: 0 };
        }
        categoryMap[habit.category].total++;
        if (log.completed) categoryMap[habit.category].completed++;
      }
    });

    const categoryData = Object.values(categoryMap).map((c) => ({
      name: c.category,
      completionRate: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
    }));

    return NextResponse.json({
      dailyChart,
      heatmap,
      categoryData,
    });
  } catch (error: any) {
    console.error("GET Analytics Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
