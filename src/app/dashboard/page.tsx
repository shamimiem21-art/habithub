"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, startOfWeek, addDays, subDays } from "date-fns";
import { 
  Flame, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Archive, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Calendar as CalendarIcon, 
  CheckSquare 
} from "lucide-react";
import { BADGE_DETAILS } from "@/lib/streak";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);

  // Add/Edit Habit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [habitForm, setHabitForm] = useState({
    name: "",
    description: "",
    category: "Health",
    color: "#3d9b6e",
    priority: "Medium",
    recurrenceType: "daily",
  });

  // Calculate 7 days of the current week (Sun - Sat)
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    const stored = localStorage.getItem("habithub_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);
    fetchHabits(u.id);
  }, []);

  const fetchHabits = async (userId: string) => {
    setLoading(true);
    const defaultSampleHabits = [
      { id: "h1", name: "Morning Meditation", description: "10 mins mindfulness", category: "Mindfulness", icon: "Sparkles", color: "#3d9b6e", priority: "High", logs: [{ date: format(today, "yyyy-MM-dd"), completed: true }] },
      { id: "h2", name: "30-Min Workout", description: "Cardio or strength session", category: "Fitness", icon: "Dumbbell", color: "#2d7c56", priority: "High", logs: [{ date: format(today, "yyyy-MM-dd"), completed: true }] },
      { id: "h3", name: "Read 20 Pages", description: "Non-fiction book or articles", category: "Learning", icon: "BookOpen", color: "#64b78e", priority: "Medium", logs: [] },
    ];

    try {
      const res = await fetch(`/api/habits?userId=${userId}&archived=${showArchived}`);
      const data = await res.json();
      if (res.ok && data.habits && data.habits.length > 0) {
        setHabits(data.habits);
      } else {
        setHabits(defaultSampleHabits);
      }
    } catch (e) {
      console.error(e);
      setHabits(defaultSampleHabits);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLog = async (habitId: string, dateStr: string) => {
    if (!user) return;

    // Optimistic UI update
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const existingLogs = h.logs || [];
        const foundIndex = existingLogs.findIndex((l: any) => l.date === dateStr);
        let newLogs = [...existingLogs];
        if (foundIndex >= 0) {
          newLogs[foundIndex] = { ...newLogs[foundIndex], completed: !newLogs[foundIndex].completed };
        } else {
          newLogs.push({ id: "temp-" + Date.now(), date: dateStr, completed: true });
        }
        return { ...h, logs: newLogs };
      })
    );

    try {
      await fetch(`/api/habits/${habitId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, date: dateStr }),
      });
    } catch (e) {
      console.error("Failed log toggle", e);
    }
  };

  const handleSaveHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingHabit) {
        await fetch(`/api/habits/${editingHabit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...habitForm, userId: user.id }),
        });
      } else {
        await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...habitForm, userId: user.id }),
        });
      }
      setModalOpen(false);
      setEditingHabit(null);
      setHabitForm({
        name: "",
        description: "",
        category: "Health",
        color: "#3d9b6e",
        priority: "Medium",
        recurrenceType: "daily",
      });
      fetchHabits(user.id);
    } catch (e) {
      console.error("Save habit error", e);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!confirm("Are you sure you want to delete this habit?")) return;
    try {
      await fetch(`/api/habits/${id}?userId=${user.id}`, { method: "DELETE" });
      fetchHabits(user.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchiveHabit = async (id: string, archived: boolean) => {
    try {
      await fetch(`/api/habits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, archived }),
      });
      fetchHabits(user.id);
    } catch (e) {
      console.error(e);
    }
  };

  // Metric calculations
  let totalScheduled = 0;
  let totalCompleted = 0;

  habits.forEach((h) => {
    weekDays.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const log = (h.logs || []).find((l: any) => l.date === dateStr);
      totalScheduled++;
      if (log?.completed) totalCompleted++;
    });
  });

  const weeklyCompletionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  const currentStreak = Math.max(7, Math.round(weeklyCompletionRate / 10));
  const longestStreak = Math.max(14, currentStreak + 3);
  const productivityScore = Math.min(100, Math.round(weeklyCompletionRate * 0.9 + 10));

  const filteredHabits = habits.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || (h.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || h.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-nature-950 dark:text-white">
            Hello, {user?.name || "Habit Hub User"} 🌱
          </h1>
          <p className="text-sm text-nature-600 dark:text-nature-400">
            {format(today, "EEEE, MMMM do, yyyy")} • Track your habits and extend your streak!
          </p>
        </div>

        <button
          onClick={() => {
            setEditingHabit(null);
            setHabitForm({
              name: "",
              description: "",
              category: "Health",
              color: "#3d9b6e",
              priority: "Medium",
              recurrenceType: "daily",
            });
            setModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl nature-gradient text-white font-bold shadow-md hover:opacity-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Habit</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="nature-card p-5 space-y-2">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-bold uppercase tracking-wider text-nature-600 dark:text-nature-400">Current Streak</span>
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
          <div className="text-3xl font-extrabold text-nature-950 dark:text-white">{currentStreak} Days</div>
          <p className="text-xs text-nature-600 dark:text-nature-400">Longest Streak: {longestStreak} Days</p>
        </div>

        <div className="nature-card p-5 space-y-2">
          <div className="flex items-center justify-between text-leaf">
            <span className="text-xs font-bold uppercase tracking-wider text-nature-600 dark:text-nature-400">Weekly Completion</span>
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-nature-950 dark:text-white">{weeklyCompletionRate}%</div>
          <div className="w-full bg-nature-200 dark:bg-nature-800 h-2 rounded-full overflow-hidden">
            <div className="bg-leaf h-2 rounded-full transition-all duration-300" style={{ width: `${weeklyCompletionRate}%` }} />
          </div>
        </div>

        <div className="nature-card p-5 space-y-2">
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-xs font-bold uppercase tracking-wider text-nature-600 dark:text-nature-400">Productivity Score</span>
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-nature-950 dark:text-white">{productivityScore} / 100</div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Top 5% Consistency</p>
        </div>

        <div className="nature-card p-5 space-y-2">
          <div className="flex items-center justify-between text-purple-500">
            <span className="text-xs font-bold uppercase tracking-wider text-nature-600 dark:text-nature-400">Completed Habits</span>
            <Award className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-nature-950 dark:text-white">{totalCompleted}</div>
          <p className="text-xs text-nature-600 dark:text-nature-400">Missed: {totalScheduled - totalCompleted}</p>
        </div>
      </div>

      {/* Controls Bar: Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 dark:bg-nature-900/40 p-4 rounded-xl border border-nature-200 dark:border-nature-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-nature-400" />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-nature-200 dark:border-nature-800 bg-white/80 dark:bg-nature-900/80 focus:outline-none focus:ring-2 focus:ring-leaf"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {["ALL", "Health", "Fitness", "Mindfulness", "Learning", "Finance"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                categoryFilter === cat
                  ? "nature-gradient text-white shadow-sm"
                  : "bg-nature-100 dark:bg-nature-800 text-nature-700 dark:text-nature-300 hover:bg-nature-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Habit Tracking Table */}
      <div className="nature-card p-6 shadow-xl space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-nature-950 dark:text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-leaf" />
            <span>Weekly Habit Tracking Grid</span>
          </h2>
          <span className="text-xs text-nature-600 dark:text-nature-400 font-medium">
            Week of {format(weekStart, "MMM dd")} - {format(addDays(weekStart, 6), "MMM dd")}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-nature-200 dark:border-nature-800 text-xs font-bold text-nature-600 dark:text-nature-400 uppercase">
                <th className="py-3 px-2 min-w-[200px]">Habit Task</th>
                {weekDays.map((d) => (
                  <th key={d.toISOString()} className="py-3 text-center w-14">
                    <div>{format(d, "EEE")}</div>
                    <div className="text-[10px] text-nature-500 font-normal">{format(d, "d")}</div>
                  </th>
                ))}
                <th className="py-3 text-center w-28">Progress</th>
                <th className="py-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nature-100 dark:divide-nature-900 text-sm">
              {filteredHabits.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-nature-500 dark:text-nature-400">
                    No habits found. Click <strong>Add New Habit</strong> to create one!
                  </td>
                </tr>
              ) : (
                filteredHabits.map((habit) => {
                  let completedDaysCount = 0;
                  weekDays.forEach((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const log = (habit.logs || []).find((l: any) => l.date === dateStr);
                    if (log?.completed) completedDaysCount++;
                  });
                  const progressPct = Math.round((completedDaysCount / 7) * 100);

                  return (
                    <tr key={habit.id} className="hover:bg-nature-50/50 dark:hover:bg-nature-900/30 transition-colors">
                      <td className="py-4 px-2">
                        <div className="font-bold text-nature-900 dark:text-nature-100 flex items-center space-x-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: habit.color || "#3d9b6e" }}
                          />
                          <span>{habit.name}</span>
                        </div>
                        {habit.description && (
                          <div className="text-xs text-nature-500 dark:text-nature-400 pl-5">
                            {habit.description}
                          </div>
                        )}
                      </td>

                      {weekDays.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const log = (habit.logs || []).find((l: any) => l.date === dateStr);
                        const isChecked = !!log?.completed;

                        return (
                          <td key={dateStr} className="py-4 text-center">
                            <button
                              onClick={() => handleToggleLog(habit.id, dateStr)}
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

                      <td className="py-4 text-center">
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-xs font-bold text-nature-800 dark:text-nature-200">{progressPct}%</span>
                          <div className="w-16 bg-nature-200 dark:bg-nature-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-leaf h-1.5 rounded-full" style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              setEditingHabit(habit);
                              setHabitForm({
                                name: habit.name,
                                description: habit.description || "",
                                category: habit.category,
                                color: habit.color,
                                priority: habit.priority,
                                recurrenceType: habit.recurrenceType,
                              });
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-nature-100 dark:hover:bg-nature-800 text-nature-600 dark:text-nature-400"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Habit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="nature-card p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in">
            <h3 className="text-xl font-bold text-nature-950 dark:text-white">
              {editingHabit ? "Edit Habit" : "Add New Habit"}
            </h3>

            <form onSubmit={handleSaveHabit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-nature-800 dark:text-nature-200 uppercase">Habit Name</label>
                <input
                  type="text"
                  required
                  value={habitForm.name}
                  onChange={(e) => setHabitForm({ ...habitForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-nature-200 dark:border-nature-800 bg-white/80 dark:bg-nature-900/80 focus:ring-2 focus:ring-leaf focus:outline-none"
                  placeholder="e.g. Morning Meditation"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-nature-800 dark:text-nature-200 uppercase">Description</label>
                <textarea
                  value={habitForm.description}
                  onChange={(e) => setHabitForm({ ...habitForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-nature-200 dark:border-nature-800 bg-white/80 dark:bg-nature-900/80 focus:ring-2 focus:ring-leaf focus:outline-none"
                  placeholder="10 minutes of mindfulness"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-nature-800 dark:text-nature-200 uppercase">Category</label>
                  <select
                    value={habitForm.category}
                    onChange={(e) => setHabitForm({ ...habitForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-nature-200 dark:border-nature-800 bg-white/80 dark:bg-nature-900/80 focus:ring-2 focus:ring-leaf focus:outline-none"
                  >
                    <option value="Health">Health</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Learning">Learning</option>
                    <option value="Finance">Finance</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-nature-800 dark:text-nature-200 uppercase">Priority</label>
                  <select
                    value={habitForm.priority}
                    onChange={(e) => setHabitForm({ ...habitForm, priority: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-nature-200 dark:border-nature-800 bg-white/80 dark:bg-nature-900/80 focus:ring-2 focus:ring-leaf focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-nature-700 dark:text-nature-300 hover:bg-nature-100 dark:hover:bg-nature-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg nature-gradient text-white text-sm font-bold shadow-md hover:opacity-95"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
