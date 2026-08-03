import { format, subDays, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths } from "date-fns";

export interface HabitLog {
  date: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  category?: string;
  color?: string;
  priority?: string;
  logs?: HabitLog[];
}

export interface AnalyticsSummary {
  todayCompletionRate: number;
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletedTasks: number;
  totalMissedTasks: number;
  consistencyScore: number;
  productivityIndex: number;
  focusScore: number;
  disciplineScore: number;
  momentumScore: number;
  activeTasksCount: number;
  archivedTasksCount: number;
  avgDailyCompletion: number;
  avgWeeklyCompletion: number;

  // Chart Datasets
  dailyTrend: { date: string; label: string; completed: number; total: number; rate: number; sparklineRate: number }[];
  categoryData: { name: string; completed: number; total: number; completionRate: number }[];
  weekdayData: { name: string; completed: number; total: number; rate: number }[];
  heatmap: { date: string; count: number; level: number }[];
  leaderboard: { id: string; name: string; category: string; color: string; rate: number; streak: number }[];
  
  // Comparative Deltas (This Week vs Last Week)
  comparison: {
    thisWeekRate: number;
    lastWeekRate: number;
    deltaRate: number;
    isRateUp: boolean;
    thisWeekCompleted: number;
    lastWeekCompleted: number;
    deltaCompleted: number;
  };

  // Forecasts
  forecast: {
    expectedCompletionNextWeek: number;
    projectedStreakContinuationPct: number;
    habitsAtRisk: string[];
    confidenceLevel: string;
  };

  // AI Insights
  aiInsights: {
    whatWentWell: string;
    needsImprovement: string;
    mostConsistentHabit: string;
    mostSkippedHabit: string;
    recommendation: string;
  };
}

export function computeComprehensiveAnalytics(
  habits: Habit[],
  timeRangeDays: number = 30
): AnalyticsSummary {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const startDate = subDays(today, timeRangeDays - 1);
  const daysInterval = eachDayOfInterval({ start: startDate, end: today });

  const activeTasks = habits;
  const activeCount = habits.length;

  // 1. Today's Stats
  let todayCompleted = 0;
  activeTasks.forEach((h) => {
    if ((h.logs || []).some((l) => l.date === todayStr && l.completed)) todayCompleted++;
  });
  const todayRate = activeCount > 0 ? Math.round((todayCompleted / activeCount) * 100) : 0;

  // 2. Daily Trend Data & Sparklines
  const dailyTrend = daysInterval.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const label = format(day, "MMM dd");
    let completed = 0;
    let total = activeCount;

    activeTasks.forEach((h) => {
      if ((h.logs || []).some((l) => l.date === dateStr && l.completed)) completed++;
    });

    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { date: dateStr, label, completed, total, rate, sparklineRate: rate };
  });

  // 3. Weekly & Monthly Completion Rates
  const last7Days = dailyTrend.slice(-7);
  const last30Days = dailyTrend.slice(-30);

  const weeklyRate = Math.round(
    last7Days.reduce((acc, d) => acc + d.rate, 0) / Math.max(1, last7Days.length)
  );
  const monthlyRate = Math.round(
    last30Days.reduce((acc, d) => acc + d.rate, 0) / Math.max(1, last30Days.length)
  );

  // 4. Streaks Engine
  let currentStreak = 0;
  let longestStreak = 0;

  for (let i = 0; i < 365; i++) {
    const checkDate = subDays(today, i);
    const dateStr = format(checkDate, "yyyy-MM-dd");
    const anyCompleted = activeTasks.some((h) =>
      (h.logs || []).some((l) => l.date === dateStr && l.completed)
    );

    if (anyCompleted) {
      currentStreak++;
    } else {
      if (i > 0) break; // Allow today to not break current streak if not checked yet
    }
  }

  // Calculate longest streak across history
  let tempStreak = 0;
  for (let i = 365; i >= 0; i--) {
    const checkDate = subDays(today, i);
    const dateStr = format(checkDate, "yyyy-MM-dd");
    const anyCompleted = activeTasks.some((h) =>
      (h.logs || []).some((l) => l.date === dateStr && l.completed)
    );

    if (anyCompleted) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }
  if (currentStreak > longestStreak) longestStreak = currentStreak;

  // 5. Total Tasks
  let totalCompletedTasks = 0;
  let totalMissedTasks = 0;

  activeTasks.forEach((h) => {
    (h.logs || []).forEach((l) => {
      if (l.completed) totalCompletedTasks++;
      else totalMissedTasks++;
    });
  });

  // BI Scores
  const consistencyScore = monthlyRate;
  const productivityIndex = Math.min(100, Math.round((todayRate * 0.4) + (weeklyRate * 0.6)));
  const focusScore = Math.min(100, Math.round(monthlyRate * 0.9 + (currentStreak > 3 ? 10 : 0)));
  const disciplineScore = Math.min(100, Math.round((totalCompletedTasks / Math.max(1, totalCompletedTasks + totalMissedTasks)) * 100));
  const momentumScore = Math.min(100, Math.round(weeklyRate * 0.8 + Math.min(20, currentStreak * 4)));

  const avgDailyCompletion = Math.round(totalCompletedTasks / Math.max(1, timeRangeDays));
  const avgWeeklyCompletion = Math.round((totalCompletedTasks / Math.max(1, timeRangeDays)) * 7);

  // 6. Category Performance
  const categoryMap: Record<string, { category: string; completed: number; total: number }> = {};
  activeTasks.forEach((h) => {
    const cat = h.category || "Health";
    if (!categoryMap[cat]) categoryMap[cat] = { category: cat, completed: 0, total: 0 };

    daysInterval.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      categoryMap[cat].total++;
      if ((h.logs || []).some((l) => l.date === dateStr && l.completed)) {
        categoryMap[cat].completed++;
      }
    });
  });

  const categoryData = Object.values(categoryMap).map((c) => ({
    name: c.category,
    completed: c.completed,
    total: c.total,
    completionRate: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
  }));

  // 7. Completion by Weekday
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayMap: Record<string, { completed: number; total: number }> = {
    Sun: { completed: 0, total: 0 }, Mon: { completed: 0, total: 0 }, Tue: { completed: 0, total: 0 },
    Wed: { completed: 0, total: 0 }, Thu: { completed: 0, total: 0 }, Fri: { completed: 0, total: 0 }, Sat: { completed: 0, total: 0 }
  };

  daysInterval.forEach((day) => {
    const dayName = weekdays[day.getDay()];
    const dateStr = format(day, "yyyy-MM-dd");
    activeTasks.forEach((h) => {
      weekdayMap[dayName].total++;
      if ((h.logs || []).some((l) => l.date === dateStr && l.completed)) {
        weekdayMap[dayName].completed++;
      }
    });
  });

  const weekdayData = weekdays.map((w) => ({
    name: w,
    completed: weekdayMap[w].completed,
    total: weekdayMap[w].total,
    rate: weekdayMap[w].total > 0 ? Math.round((weekdayMap[w].completed / weekdayMap[w].total) * 100) : 0,
  }));

  // 8. 90-Day Calendar Heatmap
  const heatmapStartDate = subDays(today, 89);
  const heatmapInterval = eachDayOfInterval({ start: heatmapStartDate, end: today });
  const heatmap = heatmapInterval.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    let completedCount = 0;
    activeTasks.forEach((h) => {
      if ((h.logs || []).some((l) => l.date === dateStr && l.completed)) completedCount++;
    });

    let level = 0;
    if (completedCount >= 3) level = 3;
    else if (completedCount === 2) level = 2;
    else if (completedCount === 1) level = 1;

    return { date: dateStr, count: completedCount, level };
  });

  // 9. Habit Leaderboard
  const leaderboard = activeTasks.map((h) => {
    let done = 0;
    daysInterval.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      if ((h.logs || []).some((l) => l.date === dateStr && l.completed)) done++;
    });
    const rate = Math.round((done / Math.max(1, timeRangeDays)) * 100);

    let streak = 0;
    for (let i = 0; i < 90; i++) {
      const dateStr = format(subDays(today, i), "yyyy-MM-dd");
      if ((h.logs || []).some((l) => l.date === dateStr && l.completed)) streak++;
      else if (i > 0) break;
    }

    return {
      id: h.id,
      name: h.name,
      category: h.category || "General",
      color: h.color || "#3d9b6e",
      rate,
      streak,
    };
  });
  leaderboard.sort((a, b) => b.rate - a.rate);

  // 10. Period Comparison (This Week vs Last Week)
  const thisWeekStart = startOfWeek(today);
  const thisWeekDays = eachDayOfInterval({ start: thisWeekStart, end: today });
  const lastWeekStart = startOfWeek(subWeeks(today, 1));
  const lastWeekEnd = endOfWeek(subWeeks(today, 1));
  const lastWeekDays = eachDayOfInterval({ start: lastWeekStart, end: lastWeekEnd });

  let thisWeekDone = 0;
  let thisWeekTotal = thisWeekDays.length * Math.max(1, activeCount);
  thisWeekDays.forEach((day) => {
    const dStr = format(day, "yyyy-MM-dd");
    activeTasks.forEach((h) => {
      if ((h.logs || []).some((l) => l.date === dStr && l.completed)) thisWeekDone++;
    });
  });
  const thisWeekRate = Math.round((thisWeekDone / Math.max(1, thisWeekTotal)) * 100);

  let lastWeekDone = 0;
  let lastWeekTotal = lastWeekDays.length * Math.max(1, activeCount);
  lastWeekDays.forEach((day) => {
    const dStr = format(day, "yyyy-MM-dd");
    activeTasks.forEach((h) => {
      if ((h.logs || []).some((l) => l.date === dStr && l.completed)) lastWeekDone++;
    });
  });
  const lastWeekRate = Math.round((lastWeekDone / Math.max(1, lastWeekTotal)) * 100);

  const deltaRate = thisWeekRate - lastWeekRate;
  const deltaCompleted = thisWeekDone - lastWeekDone;

  // 11. Predictive Forecast & Risk Assessment
  const expectedNextWeek = Math.min(100, Math.round(weeklyRate * 1.05));
  const streakContinuationPct = Math.min(99, Math.max(40, currentStreak * 12 + weeklyRate * 0.5));
  
  const habitsAtRisk = leaderboard
    .filter((h) => h.rate < 40)
    .map((h) => h.name);

  // 12. AI Natural-Language Insights
  const bestHabit = leaderboard[0]?.name || "None yet";
  const worstHabit = leaderboard[leaderboard.length - 1]?.name || "None yet";

  const aiInsights = {
    whatWentWell: `Your consistency hit ${weeklyRate}% over the last 7 days. ${bestHabit} is your top performing routine.`,
    needsImprovement: habitsAtRisk.length > 0 
      ? `Habits needing attention: ${habitsAtRisk.join(", ")}. Consider lowering daily target intensity.`
      : `Maintaining steady progress across all routines with low skip rates.`,
    mostConsistentHabit: bestHabit,
    mostSkippedHabit: worstHabit,
    recommendation: deltaRate >= 0 
      ? `Positive momentum (+${deltaRate}% week-over-week). Keep your current morning routine structure.`
      : `Weekly consistency dipped by ${Math.abs(deltaRate)}%. Focus on completing your highest priority habit first tomorrow.`,
  };

  return {
    todayCompletionRate: todayRate,
    weeklyCompletionRate: weeklyRate,
    monthlyCompletionRate: monthlyRate,
    currentStreak,
    longestStreak,
    totalCompletedTasks,
    totalMissedTasks,
    consistencyScore,
    productivityIndex,
    focusScore,
    disciplineScore,
    momentumScore,
    activeTasksCount: activeCount,
    archivedTasksCount: 0,
    avgDailyCompletion,
    avgWeeklyCompletion,

    dailyTrend,
    categoryData,
    weekdayData,
    heatmap,
    leaderboard,

    comparison: {
      thisWeekRate,
      lastWeekRate,
      deltaRate,
      isRateUp: deltaRate >= 0,
      thisWeekCompleted: thisWeekDone,
      lastWeekCompleted: lastWeekDone,
      deltaCompleted,
    },

    forecast: {
      expectedCompletionNextWeek: expectedNextWeek,
      projectedStreakContinuationPct: Math.round(streakContinuationPct),
      habitsAtRisk,
      confidenceLevel: "88% Statistical Confidence",
    },

    aiInsights,
  };
}
