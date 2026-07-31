import { NextResponse } from "next/server";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { db } from "@/lib/db";
import { calculateHabitStreak } from "@/lib/streak";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const timeframe = searchParams.get("timeframe") || "weekly"; // "weekly" | "monthly"

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Missing userId" }, { status: 401 });
    }

    const habits = await db.habit.findMany({
      where: { userId, archived: false },
      include: { logs: true },
    });

    const allLogs = await db.habitLog.findMany({
      where: { userId },
    });

    const today = new Date();
    const { currentStreak, longestStreak } = calculateHabitStreak(allLogs);

    let startDate: Date;
    let endDate: Date;
    let prevStartDate: Date;
    let prevEndDate: Date;

    if (timeframe === "weekly") {
      startDate = startOfWeek(today, { weekStartsOn: 0 });
      endDate = endOfWeek(today, { weekStartsOn: 0 });
      prevStartDate = subDays(startDate, 7);
      prevEndDate = subDays(endDate, 7);
    } else {
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
      prevStartDate = startOfMonth(subDays(startDate, 15));
      prevEndDate = endOfMonth(subDays(startDate, 15));
    }

    const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
    const intervalDateStrings = new Set(intervalDays.map((d) => format(d, "yyyy-MM-dd")));

    const prevIntervalDays = eachDayOfInterval({ start: prevStartDate, end: prevEndDate });
    const prevIntervalDateStrings = new Set(prevIntervalDays.map((d) => format(d, "yyyy-MM-dd")));

    // Compute active period metrics
    let completedCount = 0;
    let totalScheduledCount = 0;
    const habitStats: Record<string, { habitId: string; name: string; category: string; completed: number; total: number; skipped: number }> = {};
    const categoryStats: Record<string, { category: string; completed: number; total: number }> = {};

    habits.forEach((h) => {
      habitStats[h.id] = { habitId: h.id, name: h.name, category: h.category, completed: 0, total: 0, skipped: 0 };
      if (!categoryStats[h.category]) {
        categoryStats[h.category] = { category: h.category, completed: 0, total: 0 };
      }

      h.logs.forEach((log) => {
        if (intervalDateStrings.has(log.date)) {
          habitStats[h.id].total++;
          categoryStats[h.category].total++;
          totalScheduledCount++;

          if (log.completed) {
            completedCount++;
            habitStats[h.id].completed++;
            categoryStats[h.category].completed++;
          } else {
            habitStats[h.id].skipped++;
          }
        }
      });
    });

    // Previous period metrics
    let prevCompletedCount = 0;
    let prevTotalScheduledCount = 0;
    habits.forEach((h) => {
      h.logs.forEach((log) => {
        if (prevIntervalDateStrings.has(log.date)) {
          prevTotalScheduledCount++;
          if (log.completed) prevCompletedCount++;
        }
      });
    });

    const completionRate = totalScheduledCount > 0 ? Math.round((completedCount / totalScheduledCount) * 100) : 0;
    const prevCompletionRate = prevTotalScheduledCount > 0 ? Math.round((prevCompletedCount / prevTotalScheduledCount) * 100) : 0;
    const rateDiff = completionRate - prevCompletionRate;

    // Identify Best, Worst, Most Skipped Habits
    const habitStatList = Object.values(habitStats);
    habitStatList.sort((a, b) => (b.total > 0 ? b.completed / b.total : 0) - (a.total > 0 ? a.completed / a.total : 0));

    const bestHabit = habitStatList.length > 0 && habitStatList[0].total > 0 ? habitStatList[0].name : "N/A";
    const worstHabit = habitStatList.length > 0 ? habitStatList[habitStatList.length - 1].name : "N/A";

    const skippedList = [...habitStatList].sort((a, b) => b.skipped - a.skipped);
    const mostSkippedHabit = skippedList.length > 0 && skippedList[0].skipped > 0 ? skippedList[0].name : "None";

    // Productivity Score (0-100 based on completion rate and current streak bonus)
    const streakBonus = Math.min(currentStreak * 2, 15);
    const productivityScore = Math.min(100, Math.round(completionRate * 0.85 + streakBonus));

    // Suggestions Generator
    const suggestions: string[] = [];
    if (completionRate >= 85) {
      suggestions.push("🔥 Outstanding momentum! Consider increasing your target challenge or adding a new habit.");
    } else if (completionRate >= 60) {
      suggestions.push("🌱 Solid consistency. Focus on completing your most skipped habit: " + mostSkippedHabit + ".");
    } else {
      suggestions.push("💡 Try pairing missed habits with your morning routine to lower friction.");
    }

    if (currentStreak < 3) {
      suggestions.push("⚡ Set a daily reminder at 8:00 PM to lock in your daily check-in streak!");
    } else {
      suggestions.push("🎉 You're on a " + currentStreak + "-day streak! Keep up the great pace.");
    }

    // Category breakdown
    const categoryPerformance = Object.values(categoryStats).map((c) => ({
      category: c.category,
      completionRate: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
      total: c.total,
    }));

    return NextResponse.json({
      report: {
        timeframe,
        completionRate,
        completedTasks: completedCount,
        missedTasks: totalScheduledCount - completedCount,
        currentStreak,
        longestStreak,
        bestHabit,
        worstHabit,
        mostSkippedHabit,
        productivityScore,
        rateDiff,
        prevCompletionRate,
        categoryPerformance,
        suggestions,
      },
    });
  } catch (error: any) {
    console.error("GET Report Error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
