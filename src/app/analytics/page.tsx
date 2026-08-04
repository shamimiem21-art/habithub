"use client";

import { getBestUserHabits } from "@/lib/habitStore";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  computeComprehensiveAnalytics, 
  AnalyticsSummary 
} from "@/lib/analytics-engine";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  AreaChart, 
  Area,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { 
  PieChart as PieIcon, 
  Flame, 
  Calendar, 
  Award, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2, 
  Sparkles,
  BarChart3,
  Palette,
  LayoutGrid,
  Download,
  Printer,
  SlidersHorizontal,
  Target,
  Brain,
  Zap,
  Clock,
  Shield,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Eye,
  Settings2
} from "lucide-react";

// Themes configuration
const THEMES: Record<string, { name: string; bg: string; cardBg: string; text: string; primary: string; accent: string; chartColor: string }> = {
  nature: {
    name: "Nature (Green)",
    bg: "bg-nature-50 dark:bg-nature-950 text-nature-900 dark:text-nature-50",
    cardBg: "bg-white/90 dark:bg-nature-900/90 border-nature-200 dark:border-nature-800",
    text: "text-nature-900 dark:text-nature-100",
    primary: "#3d9b6e",
    accent: "#52b788",
    chartColor: "#3d9b6e",
  },
  ocean: {
    name: "Ocean (Blue)",
    bg: "bg-slate-900 text-slate-50",
    cardBg: "bg-slate-800/90 border-slate-700",
    text: "text-slate-100",
    primary: "#3b82f6",
    accent: "#06b6d4",
    chartColor: "#3b82f6",
  },
  sunset: {
    name: "Sunset (Orange)",
    bg: "bg-amber-950/20 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50",
    cardBg: "bg-white dark:bg-zinc-900 border-amber-200 dark:border-zinc-800",
    text: "text-zinc-900 dark:text-zinc-100",
    primary: "#f97316",
    accent: "#eab308",
    chartColor: "#f97316",
  },
  purple: {
    name: "Royal Purple",
    bg: "bg-purple-950/20 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50",
    cardBg: "bg-white dark:bg-purple-900/40 border-purple-200 dark:border-purple-800",
    text: "text-purple-950 dark:text-purple-100",
    primary: "#8b5cf6",
    accent: "#ec4899",
    chartColor: "#8b5cf6",
  },
  midnight: {
    name: "Midnight Dark",
    bg: "bg-black text-zinc-100",
    cardBg: "bg-zinc-900 border-zinc-800",
    text: "text-zinc-100",
    primary: "#10b981",
    accent: "#6366f1",
    chartColor: "#10b981",
  },
  minimal: {
    name: "Minimal B&W",
    bg: "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100",
    cardBg: "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700",
    text: "text-zinc-900 dark:text-zinc-100",
    primary: "#18181b",
    accent: "#71717a",
    chartColor: "#27272a",
  },
};

const defaultSampleHabits = [
  { id: "h1", name: "Morning Meditation", description: "10 mins mindfulness", category: "Mindfulness", icon: "Sparkles", color: "#3d9b6e", priority: "High", logs: [] },
  { id: "h2", name: "30-Min Workout", description: "Cardio or strength session", category: "Fitness", icon: "Dumbbell", color: "#2d7c56", priority: "High", logs: [] },
  { id: "h3", name: "Read 20 Pages", description: "Non-fiction book or articles", category: "Learning", icon: "BookOpen", color: "#64b78e", priority: "Medium", logs: [] },
];

export default function AnalyticsBIDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Customization States
  const [themeKey, setThemeKey] = useState<string>("nature");
  const [layoutPreset, setLayoutPreset] = useState<"overview" | "productivity" | "health" | "study" | "custom">("overview");
  const [chartType, setChartType] = useState<"area" | "line" | "bar" | "pie" | "radar" | "doughnut">("area");
  const [timeRangeDays, setTimeRangeDays] = useState<number>(30);
  const [customPrimaryColor, setCustomPrimaryColor] = useState<string>("#3d9b6e");
  
  // Widget visibility state
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>({
    kpiCards: true,
    mainChart: true,
    comparison: true,
    heatmap: true,
    categoryChart: true,
    leaderboard: true,
    aiInsights: true,
    forecast: true,
    goalsTracker: true,
  });

  const [analytics, setAnalytics] = useState<AnalyticsSummary>(() =>
    computeComprehensiveAnalytics(defaultSampleHabits, 30)
  );

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("habithub_user");
    let u = storedUser ? JSON.parse(storedUser) : { id: "demo-user", name: "Habit Master" };
    setUser(u);

    // Load saved theme
    const savedTheme = localStorage.getItem("habithub_analytics_theme");
    if (savedTheme && THEMES[savedTheme]) setThemeKey(savedTheme);

    const habits = getBestUserHabits(u.id);

    const data = computeComprehensiveAnalytics(habits, timeRangeDays);
    setAnalytics(data);
  }, [timeRangeDays]);

  const activeTheme = THEMES[themeKey] || THEMES.nature;
  const primaryColor = customPrimaryColor || activeTheme.primary;

  const handleThemeChange = (newKey: string) => {
    setThemeKey(newKey);
    localStorage.setItem("habithub_analytics_theme", newKey);
    if (THEMES[newKey]) setCustomPrimaryColor(THEMES[newKey].primary);
  };

  const toggleWidget = (key: string) => {
    setVisibleWidgets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const exportCSV = () => {
    if (!analytics) return;
    let csv = "Date,Completed,Total,Rate%\n";
    analytics.dailyTrend.forEach((row) => {
      csv += `${row.date},${row.completed},${row.total},${row.rate}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habithub_analytics_${timeRangeDays}d.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen space-y-8 pb-16 transition-colors duration-300 ${activeTheme.bg}`}>
      {/* Top BI Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-white/80 dark:bg-nature-900/80 border border-nature-200 dark:border-nature-800 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <span>Enterprise BI Analytics Suite</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-leaf/20 text-leaf border border-leaf/30 font-bold">
                  PRO BI v2.5
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-nature-600 dark:text-nature-400">
                Real-time performance intelligence, multi-chart studio, predictive forecasting & AI insights
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          <div className="bg-nature-100 dark:bg-nature-800/80 p-1 rounded-xl flex items-center space-x-1 border border-nature-200 dark:border-nature-700">
            {[
              { label: "7D", days: 7 },
              { label: "30D", days: 30 },
              { label: "90D", days: 90 },
              { label: "180D", days: 180 },
              { label: "365D", days: 365 },
            ].map((btn) => (
              <button
                key={btn.days}
                onClick={() => setTimeRangeDays(btn.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRangeDays === btn.days
                    ? "bg-leaf text-white shadow-sm"
                    : "text-nature-700 dark:text-nature-300 hover:bg-nature-200/50"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Theme Dropdown */}
          <div className="flex items-center space-x-1 bg-nature-100 dark:bg-nature-800/80 p-1.5 rounded-xl border border-nature-200 dark:border-nature-700">
            <Palette className="w-4 h-4 text-nature-500 ml-1" />
            <select
              value={themeKey}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-nature-800 dark:text-nature-200 focus:outline-none cursor-pointer pr-2"
            >
              {Object.keys(THEMES).map((k) => (
                <option key={k} value={k} className="bg-white dark:bg-nature-900 text-nature-900 dark:text-white">
                  {THEMES[k].name}
                </option>
              ))}
            </select>
          </div>

          {/* Export & Print */}
          <button
            onClick={exportCSV}
            className="p-2 rounded-xl bg-nature-100 dark:bg-nature-800 text-nature-700 dark:text-nature-200 hover:bg-nature-200/60 border border-nature-200 dark:border-nature-700 text-xs font-bold flex items-center space-x-1.5 transition-all"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-leaf" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-nature-100 dark:bg-nature-800 text-nature-700 dark:text-nature-200 hover:bg-nature-200/60 border border-nature-200 dark:border-nature-700 text-xs font-bold flex items-center space-x-1.5 transition-all"
            title="Print PDF"
          >
            <Printer className="w-4 h-4 text-leaf" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Preset Layout Tabs & Widget Customizer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-nature-500 flex items-center gap-1">
            <LayoutGrid className="w-3.5 h-3.5" /> Presets:
          </span>
          {(["overview", "productivity", "health", "study", "custom"] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setLayoutPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                layoutPreset === preset
                  ? "bg-leaf text-white border-leaf shadow-sm"
                  : "bg-white/60 dark:bg-nature-900/60 border-nature-200 dark:border-nature-800 text-nature-700 dark:text-nature-300 hover:border-leaf/50"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Chart Switcher Buttons */}
        <div className="flex items-center space-x-1 bg-white/60 dark:bg-nature-900/60 p-1 rounded-xl border border-nature-200 dark:border-nature-800">
          <span className="text-[10px] font-bold text-nature-500 px-2 uppercase">Chart:</span>
          {(["area", "bar", "line", "pie", "radar"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                chartType === type
                  ? "bg-leaf text-white shadow-sm"
                  : "text-nature-600 dark:text-nature-400 hover:bg-nature-200/50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 1. KPI Cards Studio */}
      {visibleWidgets.kpiCards && analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl border shadow-md space-y-3 transition-transform hover:-translate-y-1 ${activeTheme.cardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-nature-500">Today Completion</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-extrabold tracking-tight">{analytics.todayCompletionRate}%</p>
              <span className="text-xs font-bold text-emerald-500 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{analytics.todayCompletionRate}%
              </span>
            </div>
            <div className="w-full bg-nature-200 dark:bg-nature-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${analytics.todayCompletionRate}%` }} />
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-md space-y-3 transition-transform hover:-translate-y-1 ${activeTheme.cardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-nature-500">Weekly Consistency</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-extrabold tracking-tight">{analytics.weeklyCompletionRate}%</p>
              <span className="text-xs font-bold text-blue-500">7-Day Avg</span>
            </div>
            <div className="w-full bg-nature-200 dark:bg-nature-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${analytics.weeklyCompletionRate}%` }} />
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-md space-y-3 transition-transform hover:-translate-y-1 ${activeTheme.cardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-nature-500">Current Streak</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-extrabold tracking-tight">{analytics.currentStreak} <span className="text-sm font-normal">Days</span></p>
              <span className="text-xs font-bold text-amber-500">Best: {analytics.longestStreak}D</span>
            </div>
            <div className="w-full bg-nature-200 dark:bg-nature-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, analytics.currentStreak * 10)}%` }} />
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-md space-y-3 transition-transform hover:-translate-y-1 ${activeTheme.cardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-nature-500">Productivity Index</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-extrabold tracking-tight">{analytics.productivityIndex} <span className="text-sm font-normal">/ 100</span></p>
              <span className="text-xs font-bold text-purple-500">BI Index</span>
            </div>
            <div className="w-full bg-nature-200 dark:bg-nature-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${analytics.productivityIndex}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Interactive Chart Studio */}
      {visibleWidgets.mainChart && analytics && (
        <div className={`p-6 rounded-2xl border shadow-xl space-y-4 ${activeTheme.cardBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-leaf" />
              <h2 className="text-lg font-bold">Completion Rate Trend ({timeRangeDays} Days)</h2>
            </div>
            <span className="text-xs text-nature-500">Interactive Recharts Engine</span>
          </div>

          <div className="h-80 w-full pt-2">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart data={analytics.dailyTrend}>
                    <defs>
                      <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="#768065" fontSize={11} />
                    <YAxis stroke="#768065" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: "#1b4332", borderColor: "#2d7c56", color: "#fff", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="rate" stroke={primaryColor} fillOpacity={1} fill="url(#colorMain)" strokeWidth={3} />
                  </AreaChart>
                ) : chartType === "line" ? (
                  <LineChart data={analytics.dailyTrend}>
                    <XAxis dataKey="label" stroke="#768065" fontSize={11} />
                    <YAxis stroke="#768065" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: "#1b4332", borderColor: "#2d7c56", color: "#fff", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="rate" stroke={primaryColor} strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                ) : chartType === "bar" ? (
                  <BarChart data={analytics.dailyTrend}>
                    <XAxis dataKey="label" stroke="#768065" fontSize={11} />
                    <YAxis stroke="#768065" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: "#1b4332", borderColor: "#2d7c56", color: "#fff", borderRadius: "8px" }} />
                    <Bar dataKey="rate" fill={primaryColor} radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : chartType === "radar" ? (
                  <RadarChart data={analytics.weekdayData}>
                    <PolarGrid stroke="#768065" />
                    <PolarAngleAxis dataKey="name" stroke="#768065" fontSize={11} />
                    <PolarRadiusAxis domain={[0, 100]} stroke="#768065" fontSize={10} />
                    <Radar dataKey="rate" stroke={primaryColor} fill={primaryColor} fillOpacity={0.6} />
                  </RadarChart>
                ) : (
                  <RePieChart>
                    <Pie data={analytics.categoryData} dataKey="completionRate" nameKey="name" cx="50%" cy="50%" outerRadius={90} fill={primaryColor} label>
                      {(analytics.categoryData || []).map((entry, idx) => (
                        <Cell key={`c-${idx}`} fill={idx % 2 === 0 ? primaryColor : activeTheme.accent} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-nature-100 dark:bg-nature-900 animate-pulse rounded-xl flex items-center justify-center text-xs text-nature-500">
                Loading Interactive Studio Chart...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Period Comparison & Forecast Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A/B Comparison Card */}
        {visibleWidgets.comparison && analytics && (
          <div className={`p-6 rounded-2xl border shadow-xl space-y-4 ${activeTheme.cardBg}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center space-x-2">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                <span>Weekly Period Comparison</span>
              </h2>
              <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500">
                This Week vs Last Week
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-nature-50/50 dark:bg-nature-900/40 border border-nature-200 dark:border-nature-800 space-y-1">
                <span className="text-xs text-nature-500 font-bold uppercase">This Week Rate</span>
                <p className="text-2xl font-extrabold">{analytics.comparison.thisWeekRate}%</p>
                <p className="text-xs text-nature-500">{analytics.comparison.thisWeekCompleted} tasks completed</p>
              </div>

              <div className="p-4 rounded-xl bg-nature-50/50 dark:bg-nature-900/40 border border-nature-200 dark:border-nature-800 space-y-1">
                <span className="text-xs text-nature-500 font-bold uppercase">Last Week Rate</span>
                <p className="text-2xl font-extrabold">{analytics.comparison.lastWeekRate}%</p>
                <p className="text-xs text-nature-500">{analytics.comparison.lastWeekCompleted} tasks completed</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-nature-600 dark:text-nature-400">Week-over-Week Change</span>
                <p className="text-xl font-extrabold flex items-center gap-1">
                  {analytics.comparison.isRateUp ? (
                    <span className="text-emerald-500 flex items-center"><ArrowUpRight className="w-5 h-5" /> +{analytics.comparison.deltaRate}%</span>
                  ) : (
                    <span className="text-red-500 flex items-center"><ArrowDownRight className="w-5 h-5" /> {analytics.comparison.deltaRate}%</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-nature-500 font-bold">Delta Tasks</span>
                <p className="font-bold text-sm">{analytics.comparison.deltaCompleted >= 0 ? `+${analytics.comparison.deltaCompleted}` : analytics.comparison.deltaCompleted} tasks</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Natural Language Insights & Forecast */}
        {visibleWidgets.aiInsights && analytics && (
          <div className={`p-6 rounded-2xl border shadow-xl space-y-4 ${activeTheme.cardBg}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span>AI Automated Insights</span>
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-bold">
                Auto-Generated
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wide block">
                  🌟 What Went Well
                </span>
                <p className="text-nature-700 dark:text-nature-300">{analytics.aiInsights.whatWentWell}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1">
                <span className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide block">
                  💡 Personal Recommendation
                </span>
                <p className="text-nature-700 dark:text-nature-300">{analytics.aiInsights.recommendation}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs space-y-1">
                <span className="font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wide block">
                  🔮 7-Day Forecast & Risk Index
                </span>
                <p className="text-nature-700 dark:text-nature-300">
                  Projected Next Week Rate: <strong>{analytics.forecast.expectedCompletionNextWeek}%</strong> ({analytics.forecast.confidenceLevel}). Streak Continuation Probability: <strong>{analytics.forecast.projectedStreakContinuationPct}%</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* 5. Habit Leaderboard & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleWidgets.leaderboard && analytics && (
          <div className={`p-6 rounded-2xl border shadow-xl space-y-4 ${activeTheme.cardBg}`}>
            <h2 className="text-lg font-bold flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Habit Consistency Leaderboard</span>
            </h2>

            <div className="space-y-3">
              {(analytics.leaderboard || []).map((item: any, idx: number) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-nature-50/50 dark:bg-nature-900/30 border border-nature-200 dark:border-nature-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 text-center font-extrabold text-xs text-nature-400">
                      #{idx + 1}
                    </span>
                    <div className="w-3 h-8 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="font-bold text-xs">{item.name}</p>
                      <p className="text-[10px] text-nature-500">{item.category} • {item.streak}D Streak</p>
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
        )}

        {/* Weekday Distribution Bar Chart */}
        {visibleWidgets.categoryChart && analytics && (
          <div className={`p-6 rounded-2xl border shadow-xl space-y-4 ${activeTheme.cardBg}`}>
            <h2 className="text-lg font-bold flex items-center space-x-2">
              <Clock className="w-5 h-5 text-teal-500" />
              <span>Completion Distribution by Weekday</span>
            </h2>

            <div className="h-64 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.weekdayData}>
                    <XAxis dataKey="name" stroke="#768065" fontSize={11} />
                    <YAxis stroke="#768065" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: "#1b4332", borderColor: "#2d7c56", color: "#fff", borderRadius: "8px" }} />
                    <Bar dataKey="rate" fill={primaryColor} radius={[6, 6, 0, 0]}>
                      {(analytics.weekdayData || []).map((entry, index) => (
                        <Cell key={`w-${index}`} fill={index % 2 === 0 ? primaryColor : activeTheme.accent} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-nature-100 dark:bg-nature-900 animate-pulse rounded-xl flex items-center justify-center text-xs text-nature-500">
                  Loading weekday distribution chart...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
