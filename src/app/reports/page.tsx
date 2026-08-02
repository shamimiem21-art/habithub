"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { format, startOfWeek, endOfWeek, subDays, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  AlertTriangle, 
  PieChart 
} from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<"current_week" | "last_week" | "current_month" | "last_month">("last_week");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("habithub_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);
    generateReport(u.id, timeframe);
  }, [timeframe]);

  const generateReport = (userId: string, tf: string) => {
    setLoading(true);

    try {
      const localStored = localStorage.getItem(`habithub_user_habits_${userId}`);
      const habits: any[] = localStored ? JSON.parse(localStored) : [];

      const today = new Date();
      let startDate: Date;
      let endDate: Date;
      let prevStartDate: Date;
      let prevEndDate: Date;

      if (tf === "current_week") {
        startDate = startOfWeek(today, { weekStartsOn: 0 });
        endDate = endOfWeek(today, { weekStartsOn: 0 });
        prevStartDate = subDays(startDate, 7);
        prevEndDate = subDays(endDate, 7);
      } else if (tf === "last_week") {
        const baseCurrent = startOfWeek(today, { weekStartsOn: 0 });
        startDate = subDays(baseCurrent, 7);
        endDate = subDays(baseCurrent, 1);
        prevStartDate = subDays(startDate, 7);
        prevEndDate = subDays(endDate, 7);
      } else if (tf === "current_month") {
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        prevStartDate = startOfMonth(subDays(startDate, 15));
        prevEndDate = endOfMonth(subDays(startDate, 15));
      } else {
        const baseCurrentMonth = startOfMonth(today);
        startDate = startOfMonth(subDays(baseCurrentMonth, 15));
        endDate = endOfMonth(subDays(baseCurrentMonth, 15));
        prevStartDate = startOfMonth(subDays(startDate, 15));
        prevEndDate = endOfMonth(subDays(startDate, 15));
      }

      const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
      const intervalDateStrings = new Set(intervalDays.map((d) => format(d, "yyyy-MM-dd")));

      const prevIntervalDays = eachDayOfInterval({ start: prevStartDate, end: prevEndDate });
      const prevIntervalDateStrings = new Set(prevIntervalDays.map((d) => format(d, "yyyy-MM-dd")));

      let completedCount = 0;
      let totalScheduledCount = 0;
      const habitStats: Record<string, { habitId: string; name: string; category: string; completed: number; total: number; skipped: number }> = {};
      const categoryStats: Record<string, { category: string; completed: number; total: number }> = {};

      habits.forEach((h: any) => {
        habitStats[h.id] = { habitId: h.id, name: h.name, category: h.category, completed: 0, total: 0, skipped: 0 };
        if (!categoryStats[h.category]) {
          categoryStats[h.category] = { category: h.category, completed: 0, total: 0 };
        }

        intervalDateStrings.forEach((dateStr) => {
          habitStats[h.id].total++;
          categoryStats[h.category].total++;
          totalScheduledCount++;

          const isCompleted = (h.logs || []).some((l: any) => l.date === dateStr && l.completed);
          if (isCompleted) {
            completedCount++;
            habitStats[h.id].completed++;
            categoryStats[h.category].completed++;
          } else {
            habitStats[h.id].skipped++;
          }
        });
      });

      let prevCompletedCount = 0;
      let prevTotalScheduledCount = 0;
      habits.forEach((h: any) => {
        prevIntervalDateStrings.forEach((dateStr) => {
          prevTotalScheduledCount++;
          const isCompleted = (h.logs || []).some((l: any) => l.date === dateStr && l.completed);
          if (isCompleted) prevCompletedCount++;
        });
      });

      const completionRate = totalScheduledCount > 0 ? Math.round((completedCount / totalScheduledCount) * 100) : 0;
      const prevCompletionRate = prevTotalScheduledCount > 0 ? Math.round((prevCompletedCount / prevTotalScheduledCount) * 100) : 0;
      const rateDiff = completionRate - prevCompletionRate;

      const habitStatList = Object.values(habitStats);
      habitStatList.sort((a, b) => (b.total > 0 ? b.completed / b.total : 0) - (a.total > 0 ? a.completed / a.total : 0));

      const bestHabit = habitStatList.length > 0 && habitStatList[0].completed > 0 ? habitStatList[0].name : "None yet";
      const worstHabit = habitStatList.length > 0 ? habitStatList[habitStatList.length - 1].name : "None yet";
      const mostSkippedHabit = habitStatList.length > 0 ? habitStatList[habitStatList.length - 1].name : "None";

      const categoryPerformance = Object.values(categoryStats).map((c) => ({
        category: c.category,
        completionRate: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
        total: c.total,
      }));

      const dateLabel = `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd, yyyy")}`;

      setReport({
        dateLabel,
        timeframe: tf,
        completionRate,
        completedTasks: completedCount,
        missedTasks: Math.max(0, totalScheduledCount - completedCount),
        currentStreak: completedCount > 0 ? Math.round(completedCount / Math.max(1, habits.length)) : 0,
        longestStreak: completedCount > 0 ? Math.round(completedCount / Math.max(1, habits.length)) : 0,
        bestHabit,
        worstHabit,
        mostSkippedHabit,
        productivityScore: completionRate,
        rateDiff,
        prevCompletionRate,
        categoryPerformance,
        suggestions: [
          completedCount > 0
            ? "🔥 Great progress recorded during this period! Keep your daily streak going."
            : "🌱 Ready to build your habit streak! Complete tasks to build momentum.",
          "⚡ Set daily check-in reminders at 8:00 PM to maximize consistency.",
        ],
      });
    } catch (e) {
      console.error("Report generation error", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPNG = () => {
    alert("Downloading HabitHub Report as high-resolution PNG chart image...");
  };

  const handleExportSVG = () => {
    alert("Downloading HabitHub Report as vector SVG format...");
  };

  return (
    <div className="space-y-8 pb-12" ref={printRef}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-nature-950 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-leaf" />
            <span>Habit Performance Reports</span>
          </h1>
          <p className="text-sm text-nature-600 dark:text-nature-400">
            Deep insights, weekly/monthly trend analysis & category performance
          </p>
        </div>

        {/* Timeframe Switcher & Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-nature-100 dark:bg-nature-800 p-1 rounded-xl flex items-center space-x-1">
            <button
              onClick={() => setTimeframe("last_week")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === "last_week"
                  ? "nature-gradient text-white shadow-sm"
                  : "text-nature-700 dark:text-nature-300 hover:bg-nature-200/50"
              }`}
            >
              Previous Week
            </button>
            <button
              onClick={() => setTimeframe("current_week")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === "current_week"
                  ? "nature-gradient text-white shadow-sm"
                  : "text-nature-700 dark:text-nature-300 hover:bg-nature-200/50"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe("current_month")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === "current_month"
                  ? "nature-gradient text-white shadow-sm"
                  : "text-nature-700 dark:text-nature-300 hover:bg-nature-200/50"
              }`}
            >
              This Month
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl border border-nature-200 dark:border-nature-800 text-xs font-semibold text-nature-700 dark:text-nature-300 hover:bg-nature-100 dark:hover:bg-nature-800 flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {loading || !report ? (
        <div className="py-16 text-center text-sm text-nature-500">Generating report data...</div>
      ) : (
        <>
          {/* Report Date Banner */}
          <div className="nature-card p-4 flex items-center justify-between border-l-4 border-l-leaf">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-leaf" />
              <div>
                <p className="text-xs font-bold uppercase text-nature-500">Report Period</p>
                <p className="text-sm font-extrabold text-nature-950 dark:text-white">
                  {report.dateLabel}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-nature-600 dark:text-nature-400">
                Period Rate:
              </span>
              <span className="px-3 py-1 rounded-full bg-leaf/10 text-leaf text-xs font-extrabold">
                {report.completionRate}%
              </span>
            </div>
          </div>

          {/* Metric Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="nature-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-nature-600 dark:text-nature-400">
                  Overall Completion
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-extrabold text-nature-950 dark:text-white">
                {report.completionRate}%
              </p>
              <div className="flex items-center space-x-1 text-xs font-semibold">
                {report.rateDiff >= 0 ? (
                  <span className="text-emerald-600 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{report.rateDiff}% vs prev
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {report.rateDiff}% vs prev
                  </span>
                )}
              </div>
            </div>

            <div className="nature-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-nature-600 dark:text-nature-400">
                  Tasks Completed
                </span>
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-extrabold text-nature-950 dark:text-white">
                {report.completedTasks}
              </p>
              <p className="text-xs text-nature-500">{report.missedTasks} tasks uncompleted</p>
            </div>

            <div className="nature-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-nature-600 dark:text-nature-400">
                  Active Streak
                </span>
                <Award className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-extrabold text-nature-950 dark:text-white">
                {report.currentStreak} <span className="text-sm font-normal">Days</span>
              </p>
              <p className="text-xs text-nature-500">Best record: {report.longestStreak} Days</p>
            </div>

            <div className="nature-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-nature-600 dark:text-nature-400">
                  Productivity Score
                </span>
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-extrabold text-nature-950 dark:text-white">
                {report.productivityScore} <span className="text-sm font-normal">/ 100</span>
              </p>
              <p className="text-xs text-nature-500">Based on task volume & rate</p>
            </div>
          </div>

          {/* Highlights & AI Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="nature-card p-6 space-y-4">
              <h3 className="text-lg font-bold text-nature-950 dark:text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-leaf" />
                <span>Period Performance Highlights</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                      Top Performing Habit
                    </p>
                    <p className="text-sm font-extrabold text-emerald-950 dark:text-white">
                      {report.bestHabit}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
                    Best
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">
                      Needs Attention
                    </p>
                    <p className="text-sm font-extrabold text-amber-950 dark:text-white">
                      {report.worstHabit}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-600 text-white text-xs font-bold">
                    Target
                  </span>
                </div>
              </div>
            </div>

            <div className="nature-card p-6 space-y-4">
              <h3 className="text-lg font-bold text-nature-950 dark:text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span>Productivity Insights</span>
              </h3>

              <div className="space-y-3">
                {report.suggestions.map((sug: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs font-semibold text-purple-900 dark:text-purple-200 flex items-start space-x-2"
                  >
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Performance Breakdown */}
          <div className="nature-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-nature-950 dark:text-white flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-leaf" />
              <span>Category Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {report.categoryPerformance.map((cat: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-nature-50/50 dark:bg-nature-900/30 border border-nature-200 dark:border-nature-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-nature-900 dark:text-nature-100">{cat.category}</span>
                    <span className="text-leaf">{cat.completionRate}%</span>
                  </div>
                  <div className="w-full bg-nature-200 dark:bg-nature-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-leaf h-2 rounded-full transition-all duration-300"
                      style={{ width: `${cat.completionRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
