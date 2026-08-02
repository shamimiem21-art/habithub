"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  PieChart as PieIcon, 
  Flame, 
  Calendar, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  BarChart3
} from "lucide-react";

const defaultSampleHabits = [
  { id: "h1", name: "Morning Meditation", description: "10 mins mindfulness", category: "Mindfulness", icon: "Sparkles", color: "#3d9b6e", priority: "High", logs: [] },
  { id: "h2", name: "30-Min Workout", description: "Cardio or strength session", category: "Fitness", icon: "Dumbbell", color: "#2d7c56", priority: "High", logs: [] },
  { id: "h3", name: "Read 20 Pages", description: "Non-fiction book or articles", category: "Learning", icon: "BookOpen", color: "#64b78e", priority: "Medium", logs: [] },
];

function generateAnalyticsData(habits: any[], daysCount: number) {
  const today = new Date();
  const startDate = subDays(today, daysCount - 1);
  const daysInterval = eachDayOfInterval({ start: startDate, end: today });

  const dailyChart = daysInterval.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const label = format(day, "MMM dd");
    let completed = 0;
    let total = habits.length;

    habits.forEach((h) => {
      const isDone = (h.logs || []).some((l: any) => l.date === dateStr && l.completed);
      if (isDone) completed++;
    });

    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { date: dateStr, label, completed, total, rate };
  });

  const heatmapStartDate = subDays(today, 89);
  const heatmapInterval = eachDayOfInterval({ start: heatmapStartDate, end: today });

  const heatmap = heatmapInterval.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    let completedCount = 0;
    habits.forEach((h) => {
      if ((h.logs || []).some((l: any) => l.date === dateStr && l.completed)) {
        completedCount++;
      }
    });

    let level = 0;
    if (completedCount >= 3) level = 3;
    else if (completedCount === 2) level = 2;
    else if (completedCount === 1) level = 1;

    return { date: dateStr, count: completedCount, level };
  });

  const categoryMap: Record<string, { category: string; completed: number; total: number }> = {};
  habits.forEach((h) => {
    const cat = h.category || "Health";
    if (!categoryMap[cat]) categoryMap[cat] = { category: cat, completed: 0, total: 0 };

    daysInterval.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      categoryMap[cat].total++;
      if ((h.logs || []).some((l: any) => l.date === dateStr && l.completed)) {
        categoryMap[cat].completed++;
      }
    });
  });

  const categoryData = Object.values(categoryMap).map((c) => ({
    name: c.category,
    completionRate: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
    completed: c.completed,
    total: c.total,
  }));

  const leaderboard = habits.map((h) => {
    let done = 0;
    daysInterval.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      if ((h.logs || []).some((l: any) => l.date === dateStr && l.completed)) done++;
    });
    const rate = Math.round((done / Math.max(1, daysCount)) * 100);
    return { id: h.id, name: h.name, category: h.category, color: h.color || "#3d9b6e", done, rate };
  });
  leaderboard.sort((a, b) => b.rate - a.rate);

  const totalAllCompleted = habits.reduce((acc, h) => acc + (h.logs || []).filter((l: any) => l.completed).length, 0);
  const overallCompletionRate = dailyChart.reduce((acc, d) => acc + d.rate, 0) / Math.max(1, dailyChart.length);

  return {
    dailyChart,
    heatmap,
    categoryData,
    leaderboard,
    totalAllCompleted,
    overallRate: Math.round(overallCompletionRate),
    totalHabitsCount: habits.length,
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<"14" | "30" | "90">("30");
  const [analytics, setAnalytics] = useState<any>(() => generateAnalyticsData(defaultSampleHabits, 30));

  useEffect(() => {
    const stored = localStorage.getItem("habithub_user");
    let u = stored ? JSON.parse(stored) : { id: "demo-user", name: "Habit Master" };
    setUser(u);

    const localStored = localStorage.getItem(`habithub_user_habits_${u.id}`);
    let habits: any[] = localStored ? JSON.parse(localStored) : [];
    if (!Array.isArray(habits) || habits.length === 0) {
      habits = defaultSampleHabits;
    }

    const data = generateAnalyticsData(habits, parseInt(timeRange, 10));
    setAnalytics(data);
  }, [timeRange]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-nature-950 dark:text-white flex items-center space-x-2">
            <PieIcon className="w-8 h-8 text-leaf" />
            <span>Analytics & Progress Heatmaps</span>
          </h1>
          <p className="text-sm text-nature-600 dark:text-nature-400">
            Interactive completion graphs, 90-day consistency heatmap, category analytics & leaderboards
          </p>
        </div>

        {/* Range Selector */}
        <div className="bg-nature-100 dark:bg-nature-800 p-1 rounded-xl flex items-center space-x-1 self-start sm:self-auto">
          <button
            onClick={() => setTimeRange("14")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === "14"
                ? "nature-gradient text-white shadow-sm"
                : "text-nature-700 dark:text-nature-300 hover:bg-nature-200/50"
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setTimeRange("30")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === "30"
                ? "nature-gradient text-white shadow-sm"
                : "text-nature-700 dark:text-nature-300 hover:bg-nature-200/50"
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange("90")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === "90"
                ? "nature-gradient text-white shadow-sm"
                : "text-nature-700 dark:text-nature-300 hover:bg-nature-200/50"
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="nature-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-nature-600 dark:text-nature-400">
                Total Completed Tasks
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-extrabold text-nature-950 dark:text-white">
              {analytics.totalAllCompleted}
            </p>
            <p className="text-xs text-nature-500">All-time task logs</p>
          </div>

          <div className="nature-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-nature-600 dark:text-nature-400">
                Average Completion Rate
              </span>
              <TrendingUp className="w-5 h-5 text-leaf" />
            </div>
            <p className="text-3xl font-extrabold text-nature-950 dark:text-white">
              {analytics.overallRate}%
            </p>
            <p className="text-xs text-nature-500">Over past {timeRange} days</p>
          </div>

          <div className="nature-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-nature-600 dark:text-nature-400">
                Active Tracked Habits
              </span>
              <Award className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-extrabold text-nature-950 dark:text-white">
              {analytics.totalHabitsCount}
            </p>
            <p className="text-xs text-nature-500">Active habits in tracker</p>
          </div>

          <div className="nature-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-nature-600 dark:text-nature-400">
                Consistency Score
              </span>
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-extrabold text-nature-950 dark:text-white">
              {analytics.overallRate} <span className="text-sm font-normal">/ 100</span>
            </p>
            <p className="text-xs text-nature-500">Consistency rating index</p>
          </div>
        </div>

        {/* Daily Completion Trend Chart */}
        <div className="nature-card p-6 space-y-4 shadow-lg">
          <h2 className="text-lg font-bold text-nature-950 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-leaf" />
            <span>Completion Rate Trend ({timeRange} Days)</span>
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyChart}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3d9b6e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3d9b6e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#768065" fontSize={11} />
                <YAxis stroke="#768065" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1b4332",
                    borderColor: "#2d7c56",
                    color: "#fff",
                    borderRadius: "8px",
                  }}
                />
                <Area type="monotone" dataKey="rate" stroke="#3d9b6e" fillOpacity={1} fill="url(#colorRate)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 90-Day Calendar Heatmap Grid */}
        <div className="nature-card p-6 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-nature-950 dark:text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-leaf" />
              <span>90-Day Habit Activity Heatmap</span>
            </h2>
            <div className="flex items-center space-x-2 text-xs text-nature-500">
              <span>Less</span>
              <span className="w-3 h-3 rounded bg-nature-200/50 dark:bg-nature-800/50" />
              <span className="w-3 h-3 rounded bg-nature-300 dark:bg-nature-700" />
              <span className="w-3 h-3 rounded bg-nature-500" />
              <span className="w-3 h-3 rounded bg-leaf" />
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-18 gap-1.5 pt-2">
            {(analytics.heatmap || []).map((day: any) => {
              const colorClass =
                day.level === 0
                  ? "bg-nature-200/50 dark:bg-nature-800/50"
                  : day.level === 1
                  ? "bg-nature-300 dark:bg-nature-700"
                  : day.level === 2
                  ? "bg-nature-500"
                  : "bg-leaf text-white";

              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} habits completed`}
                  className={`w-full aspect-square rounded-md ${colorClass} transition-transform hover:scale-125 cursor-pointer`}
                />
              );
            })}
          </div>
        </div>

        {/* Category Bar Chart & Habit Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="nature-card p-6 space-y-4 shadow-lg">
            <h2 className="text-lg font-bold text-nature-950 dark:text-white flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-leaf" />
              <span>Category Performance</span>
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryData}>
                  <XAxis dataKey="name" stroke="#768065" fontSize={11} />
                  <YAxis stroke="#768065" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1b4332",
                      borderColor: "#2d7c56",
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="completionRate" fill="#3d9b6e" radius={[8, 8, 0, 0]}>
                    {(analytics.categoryData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#3d9b6e" : "#52b788"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="nature-card p-6 space-y-4 shadow-lg">
            <h2 className="text-lg font-bold text-nature-950 dark:text-white flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Habit Consistency Leaderboard</span>
            </h2>

            <div className="space-y-3">
              {(analytics.leaderboard || []).map((item: any, idx: number) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-nature-50/50 dark:bg-nature-900/30 border border-nature-200 dark:border-nature-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 text-center font-extrabold text-xs text-nature-400">
                      #{idx + 1}
                    </span>
                    <div className="w-3 h-8 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="font-bold text-xs text-nature-900 dark:text-nature-100">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-nature-500">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-leaf">{item.rate}%</span>
                    <div className="w-16 bg-nature-200 dark:bg-nature-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-leaf h-1.5 rounded-full"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
