"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Sprout, 
  Flame, 
  BarChart3, 
  Bell, 
  ShieldCheck, 
  Zap, 
  Check, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Sparkles 
} from "lucide-react";

export default function LandingPage() {
  const [demoState, setDemoState] = useState<{ [key: string]: boolean }>({
    "1-sun": true, "1-mon": true, "1-tue": true, "1-wed": true, "1-thu": true,
    "2-sun": true, "2-mon": false, "2-tue": true, "2-wed": true, "2-thu": true,
    "3-sun": true, "3-mon": true, "3-tue": true, "3-wed": true, "3-thu": true,
  });

  const toggleDemoCell = (key: string) => {
    setDemoState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-8">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-nature-100 dark:bg-nature-900/60 border border-nature-300 dark:border-nature-700 text-xs font-semibold text-nature-800 dark:text-nature-200 shadow-sm animate-pulse">
          <Sparkles className="w-4 h-4 text-leaf" />
          <span>HabitHub v2.0 - Next-Gen Habit & Task Tracking Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-nature-950 dark:text-white leading-tight">
          Cultivate Habits That <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-forest via-leaf to-mint bg-clip-text text-transparent">
            Transform Your Daily Life
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-nature-700 dark:text-nature-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Master unbroken streaks, generate automated weekly/monthly performance reports, and analyze productivity trends with complete user data isolation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl nature-gradient text-white font-semibold text-lg shadow-lg hover:opacity-95 hover:shadow-xl transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Start Free - Immediate Access</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl nature-card text-nature-800 dark:text-nature-200 font-semibold text-lg hover:bg-nature-100/50 transition-colors flex items-center justify-center"
          >
            Sign In
          </Link>
        </div>

        {/* Demo Credentials Box */}
        <div className="mt-8 p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 max-w-md mx-auto text-left text-xs space-y-1">
          <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Quick Demo Credentials:
          </p>
          <div className="grid grid-cols-2 gap-2 text-nature-700 dark:text-nature-300 font-mono pt-1">
            <div>
              <span className="font-semibold block text-nature-900 dark:text-nature-100">User Login:</span>
              user@habithub.app / Password123!
            </div>
            <div>
              <span className="font-semibold block text-nature-900 dark:text-nature-100">Admin Login:</span>
              admin@habithub.app / AdminPassword123!
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Habit Matrix Preview */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-nature-950 dark:text-white">
            Interactive 7-Day Habit Matrix
          </h2>
          <p className="text-sm text-nature-600 dark:text-nature-400">
            Click any checkbox below to experience instant state updates & streak progression live.
          </p>
        </div>

        <div className="nature-card p-6 shadow-xl max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-nature-200 dark:border-nature-800 text-xs font-bold text-nature-600 dark:text-nature-400 uppercase">
                <th className="pb-3">Habit Task</th>
                {days.map((d) => (
                  <th key={d} className="pb-3 text-center w-12">{d}</th>
                ))}
                <th className="pb-3 text-right">Weekly Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nature-100 dark:divide-nature-900 text-sm">
              {[
                { id: "1", name: "Morning Meditation", icon: "🧘‍♂️", color: "bg-emerald-500" },
                { id: "2", name: "30-Min Workout", icon: "🏋️‍♂️", color: "bg-teal-500" },
                { id: "3", name: "Read 20 Pages", icon: "📚", color: "bg-leaf" },
              ].map((habit) => {
                const checkedCount = days.filter((_, idx) => {
                  const dayKey = `${habit.id}-${days[idx].toLowerCase()}`;
                  return demoState[dayKey];
                }).length;
                const progressPct = Math.round((checkedCount / 7) * 100);

                return (
                  <tr key={habit.id} className="hover:bg-nature-50/50 dark:hover:bg-nature-900/30">
                    <td className="py-4 font-semibold text-nature-900 dark:text-nature-100 flex items-center space-x-2">
                      <span className="text-lg">{habit.icon}</span>
                      <span>{habit.name}</span>
                    </td>
                    {days.map((_, idx) => {
                      const dayKey = `${habit.id}-${days[idx].toLowerCase()}`;
                      const isChecked = demoState[dayKey];
                      return (
                        <td key={idx} className="py-4 text-center">
                          <button
                            onClick={() => toggleDemoCell(dayKey)}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                              isChecked
                                ? "nature-gradient text-white shadow-sm scale-105"
                                : "border-2 border-nature-300 dark:border-nature-700 hover:border-leaf"
                            }`}
                          >
                            {isChecked && <Check className="w-4 h-4" />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="font-bold text-xs text-nature-800 dark:text-nature-200">{progressPct}%</span>
                        <div className="w-20 bg-nature-200 dark:bg-nature-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-leaf h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-12 max-w-6xl mx-auto">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-nature-950 dark:text-white">
            Built for Complete Habit Mastery
          </h2>
          <p className="text-base text-nature-600 dark:text-nature-400">
            Everything you need from daily tracking to enterprise admin controls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Flame,
              title: "Streak Engine & Badges",
              desc: "Automatic streak calculation, perfect week/month detection, and milestone badges (7, 30, 90, 180, 365 days).",
            },
            {
              icon: BarChart3,
              title: "Weekly & Monthly Reports",
              desc: "Comprehensive performance reports with best/worst habit identification, category breakdown, and PDF export.",
            },
            {
              icon: ShieldCheck,
              title: "Private User Isolation",
              desc: "Complete data isolation enforced at API, database, and UI levels. Isolated separate Admin authentication system.",
            },
            {
              icon: Bell,
              title: "Smart Notifications & Email",
              desc: "Browser Push API reminders and optional weekly email summaries automatically generated for users.",
            },
            {
              icon: Award,
              title: "Calendar & Heatmap Views",
              desc: "Navigate past dates, review historical habit completions, and monitor daily progress heatmaps.",
            },
            {
              icon: Zap,
              title: "Plugin Architecture",
              desc: "Future expansion architecture supporting Pomodoro timer, Expense Tracker, AI Coach, and Mood Journal modules.",
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="nature-card p-6 space-y-4 hover:border-leaf/60">
                <div className="w-12 h-12 rounded-xl bg-nature-100 dark:bg-nature-800 text-forest dark:text-mint flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-nature-900 dark:text-nature-100">{feature.title}</h3>
                <p className="text-sm text-nature-600 dark:text-nature-400 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="nature-gradient rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to Build Unbreakable Habits?</h2>
        <p className="text-lg opacity-90 max-w-xl mx-auto">
          Join thousands of users building consistency day by day with HabitHub.
        </p>
        <div>
          <Link
            href="/register"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-white text-forest font-bold text-lg hover:bg-nature-50 shadow-lg transition-all"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
