"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("weekly");
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
    fetchReport(u.id, timeframe);
  }, [timeframe]);

  const fetchReport = async (userId: string, tf: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?userId=${userId}&timeframe=${tf}`);
      const data = await res.json();
      if (res.ok) {
        setReport(data.report);
      }
    } catch (e) {
      console.error(e);
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
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-nature-950 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-leaf" />
            <span>Habit Performance Reports</span>
          </h1>
          <p className="text-sm text-nature-600 dark:text-nature-400">
            Deep insights, trend analysis, category performance & AI habit suggestions
          </p>
        </div>

        {/* Timeframe Switcher & Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-nature-100 dark:bg-nature-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setTimeframe("weekly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === "weekly"
                  ? "nature-gradient text-white shadow-sm"
                  : "text-nature-700 dark:text-nature-300 hover:bg-nature-200/50"
              }`}
            >
              Weekly Report
            </button>
            <button
              onClick={() => setTimeframe("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === "monthly"
                  ? "nature-gradient text-white shadow-sm"
                  : "text-nature-700 dark:text-nature-300 hover:bg-nature-200/50"
              }`}
            >
              Monthly Report
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-white/80 dark:bg-nature-900/80 border border-nature-200 dark:border-nature-800 text-xs font-semibold text-nature-800 dark:text-nature-200 hover:bg-nature-100 flex items-center space-x-1"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          <button
            onClick={handleExportPNG}
            className="px-3 py-2 rounded-xl bg-white/80 dark:bg-nature-900/80 border border-nature-200 dark:border-nature-800 text-xs font-semibold text-nature-800 dark:text-nature-200 hover:bg-nature-100 flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>PNG</span>
          </button>
        </div>
      </div>

      {loading || !report ? (
        <div className="nature-card p-12 text-center text-nature-600 dark:text-nature-400">
          Generating {timeframe} performance report...
        </div>
      ) : (
        <div ref={printRef} className="space-y-8">
          {/* Summary Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="nature-card p-5 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-nature-600 dark:text-nature-400">Completion Rate</div>
              <div className="text-3xl font-extrabold text-nature-950 dark:text-white flex items-center space-x-2">
                <span>{report.completionRate}%</span>
                {report.rateDiff >= 0 ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{report.rateDiff}%
                  </span>
                ) : (
                  <span className="text-xs text-red-500 font-bold flex items-center">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />{report.rateDiff}%
                  </span>
                )}
              </div>
              <p className="text-xs text-nature-500">Vs. Previous {timeframe === "weekly" ? "Week" : "Month"} ({report.prevCompletionRate}%)</p>
            </div>

            <div className="nature-card p-5 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-nature-600 dark:text-nature-400">Completed vs Missed</div>
              <div className="text-3xl font-extrabold text-nature-950 dark:text-white flex items-center space-x-2">
                <span className="text-emerald-600">{report.completedTasks}</span>
                <span className="text-sm font-normal text-nature-400">/</span>
                <span className="text-red-500">{report.missedTasks}</span>
              </div>
              <p className="text-xs text-nature-500">Total Check-in Tasks</p>
            </div>

            <div className="nature-card p-5 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-nature-600 dark:text-nature-400">Current & Longest Streak</div>
              <div className="text-3xl font-extrabold text-amber-500 flex items-center space-x-2">
                <Flame className="w-7 h-7" />
                <span>{report.currentStreak} Days</span>
              </div>
              <p className="text-xs text-nature-500">Record: {report.longestStreak} Days</p>
            </div>

            <div className="nature-card p-5 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-nature-600 dark:text-nature-400">Productivity Score</div>
              <div className="text-3xl font-extrabold text-leaf">{report.productivityScore} / 100</div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">High Consistency Level</p>
            </div>
          </div>

          {/* Best, Worst, Most Skipped Habits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="nature-card p-6 space-y-3 border-emerald-300 dark:border-emerald-800">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                <Award className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase">Best Habit</h3>
              </div>
              <div className="text-xl font-extrabold text-nature-900 dark:text-nature-100">{report.bestHabit}</div>
              <p className="text-xs text-nature-600 dark:text-nature-400">Highest completion accuracy during this period.</p>
            </div>

            <div className="nature-card p-6 space-y-3 border-amber-300 dark:border-amber-800">
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase">Needs Focus</h3>
              </div>
              <div className="text-xl font-extrabold text-nature-900 dark:text-nature-100">{report.worstHabit}</div>
              <p className="text-xs text-nature-600 dark:text-nature-400">Lowest check-in rate. Needs routine adjustments.</p>
            </div>

            <div className="nature-card p-6 space-y-3 border-red-300 dark:border-red-800">
              <div className="flex items-center space-x-2 text-red-500">
                <XCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase">Most Skipped Habit</h3>
              </div>
              <div className="text-xl font-extrabold text-nature-900 dark:text-nature-100">{report.mostSkippedHabit}</div>
              <p className="text-xs text-nature-600 dark:text-nature-400">Habit with the highest total skip count.</p>
            </div>
          </div>

          {/* Category Performance Breakdown */}
          <div className="nature-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-nature-950 dark:text-white flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-leaf" />
              <span>Category Performance Analysis</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(report.categoryPerformance || []).map((cat: any) => (
                <div key={cat.category} className="p-4 rounded-xl bg-nature-50/70 dark:bg-nature-900/50 space-y-2 border border-nature-200 dark:border-nature-800">
                  <div className="flex items-center justify-between text-sm font-bold text-nature-900 dark:text-nature-100">
                    <span>{cat.category}</span>
                    <span className="text-leaf">{cat.completionRate}%</span>
                  </div>
                  <div className="w-full bg-nature-200 dark:bg-nature-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-leaf h-2 rounded-full" style={{ width: `${cat.completionRate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Suggestions */}
          <div className="nature-card p-6 space-y-4 bg-gradient-to-br from-nature-100/50 to-mint/10 dark:from-nature-900/40 dark:to-nature-950">
            <h3 className="text-lg font-bold text-nature-950 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-leaf" />
              <span>AI Coaching & Performance Suggestions</span>
            </h3>

            <ul className="space-y-2 text-sm text-nature-800 dark:text-nature-200">
              {(report.suggestions || []).map((s: string, idx: number) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-leaf font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
