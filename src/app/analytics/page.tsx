"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { PieChart as PieIcon, Flame, Calendar, Award } from "lucide-react";

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("habithub_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);
    fetchAnalytics(u.id);
  }, []);

  const fetchAnalytics = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-nature-950 dark:text-white flex items-center space-x-2">
          <PieIcon className="w-8 h-8 text-leaf" />
          <span>Analytics & Progress Heatmaps</span>
        </h1>
        <p className="text-sm text-nature-600 dark:text-nature-400">
          Visual graphs of daily completions, 90-day activity heatmaps, and category statistics
        </p>
      </div>

      {loading || !analytics ? (
        <div className="nature-card p-12 text-center text-nature-600 dark:text-nature-400">
          Loading analytics graphs...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Daily Completion Trend Chart */}
          <div className="nature-card p-6 space-y-4 shadow-lg">
            <h2 className="text-lg font-bold text-nature-950 dark:text-white">14-Day Completion Rate Trend</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyChart}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3d9b6e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3d9b6e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#768065" fontSize={12} />
                  <YAxis stroke="#768065" fontSize={12} domain={[0, 100]} />
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-nature-950 dark:text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-leaf" />
                <span>90-Day Consistency Heatmap Grid</span>
              </h2>
              <div className="flex items-center space-x-2 text-xs text-nature-500">
                <span>Less</span>
                <span className="w-3 h-3 rounded bg-nature-200 dark:bg-nature-800" />
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

          {/* Category Bar Chart */}
          <div className="nature-card p-6 space-y-4 shadow-lg">
            <h2 className="text-lg font-bold text-nature-950 dark:text-white">Category Completion Comparison</h2>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryData}>
                  <XAxis dataKey="name" stroke="#768065" fontSize={12} />
                  <YAxis stroke="#768065" fontSize={12} domain={[0, 100]} />
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
        </div>
      )}
    </div>
  );
}
