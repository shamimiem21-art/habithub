"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, startOfWeek, addDays } from "date-fns";
import { 
  Flame, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
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
  CheckSquare,
  RefreshCw
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
  }, [showArchived]);

  const fetchHabits = async (userId: string) => {
    setLoading(true);

    const defaultSampleHabits = [
      { id: "h1", name: "Morning Meditation", description: "10 mins mindfulness", category: "Mindfulness", icon: "Sparkles", color: "#3d9b6e", priority: "High", logs: [] },
      { id: "h2", name: "30-Min Workout", description: "Cardio or strength session", category: "Fitness", icon: "Dumbbell", color: "#2d7c56", priority: "High", logs: [] },
      { id: "h3", name: "Read 20 Pages", description: "Non-fiction book or articles", category: "Learning", icon: "BookOpen", color: "#64b78e", priority: "Medium", logs: [] },
    ];

    try {
      const localStored = localStorage.getItem(`habithub_user_habits_${userId}`);
      if (localStored) {
        const parsed = JSON.parse(localStored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHabits(parsed);
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`/api/habits?userId=${userId}&archived=${showArchived}`);
      const data = await res.json();
      if (res.ok && data.habits && data.habits.length > 0) {
        setHabits(data.habits);
        localStorage.setItem(`habithub_user_habits_${userId}`, JSON.stringify(data.habits));
      } else {
        setHabits(defaultSampleHabits);
        localStorage.setItem(`habithub_user_habits_${userId}`, JSON.stringify(defaultSampleHabits));
      }
    } catch (e) {
      console.error(e);
      setHabits(defaultSampleHabits);
      localStorage.setItem(`habithub_user_habits_${userId}`, JSON.stringify(defaultSampleHabits));
    } finally {
      setLoading(false);
    }
  };

  const handleResetAllToZero = () => {
    if (!user) return;
    if (!confirm("Are you sure you want to reset all habit progress to 0?")) return;
    const resetHabits = habits.map((h) => ({ ...h, logs: [] }));
    setHabits(resetHabits);
    localStorage.setItem(`habithub_user_habits_${user.id}`, JSON.stringify(resetHabits));
  };

  const handleToggleLog = async (habitId: string, dateStr: string) => {
    if (!user) return;

    const updatedHabits = habits.map((h) => {
      if (h.id !== habitId) return h;
      const existingLogs = h.logs || [];
      const foundIndex = existingLogs.findIndex((l: any) => l.date === dateStr);
      let newLogs = [...existingLogs];
      if (foundIndex >= 0) {
        newLogs[foundIndex] = { ...newLogs[foundIndex], completed: !newLogs[foundIndex].completed };
      } else {
        newLogs.push({ id: "log-" + Date.now(), date: dateStr, completed: true });
      }
      return { ...h, logs: newLogs };
    });

    setHabits(updatedHabits);
    localStorage.setItem(`habithub_user_habits_${user.id}`, JSON.stringify(updatedHabits));

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

    let updatedList = [...habits];
    if (editingHabit) {
      updatedList = habits.map((h) => (h.id === editingHabit.id ? { ...h, ...habitForm } : h));
    } else {
      const newHabit = {
        id: "hbt-" + Math.random().toString(36).substring(2, 9),
        ...habitForm,
        logs: [],
        archived: false,
      };
      updatedList.push(newHabit);
    }

    setHabits(updatedList);
    localStorage.setItem(`habithub_user_habits_${user.id}`, JSON.stringify(updatedList));

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
    } catch (e) {
      console.error("Save habit error", e);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this habit?")) return;
    const updatedList = habits.filter((h) => h.id !== id);
    setHabits(updatedList);
    localStorage.setItem(`habithub_user_habits_${user.id}`, JSON.stringify(updatedList));

    try {
      await fetch(`/api/habits/${id}?userId=${user.id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchiveHabit = async (id: string, archived: boolean) => {
    if (!user) return;
    const updatedList = habits.map((h) => (h.id === id ? { ...h, archived } : h));
    setHabits(updatedList);
    localStorage.setItem(`habithub_user_habits_${user.id}`, JSON.stringify(updatedList));

    try {
      await fetch(`/api/habits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, archived }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Metric calculations starting at 0
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
  const currentStreak = totalCompleted > 0 ? Math.round(totalCompleted / Math.max(1, habits.length)) : 0;
  const longestStreak = currentStreak;
  const productivityScore = weeklyCompletionRate;

  const filteredHabits = habits.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || (h.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || h.category === categoryFilter;
    const matchesArchived = showArchived ? h.archived === true : !h.archived;
    return matchesSearch && matchesCategory && matchesArchived;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-nature-950 dark:text-white flex items-center space-x-3">
            <span>Welcome back, {user?.name || "Habit Master"}!</span>
            <span className="text-2xl">🌱</span>
          </h1>
          <p className="text-sm text-nature-600 dark:text-nature-400 mt-1">
            Track your daily tasks, maintain streaks, and build habits from scratch.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetAllToZero}
            className="px-3 py-2 rounded-xl border border-nature-300 dark:border-nature-700 text-xs font-semibold text-nature-700 dark:text-nature-300 hover:bg-nature-100 dark:hover:bg-nature-800 transition-colors flex items-center space-x-1"
            title="Reset all habit progress to 0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All to 0</span>
          </button>

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
            className="px-4 py-2.5 rounded-xl nature-gradient text-white font-semibold text-sm shadow-md hover:opacity-95 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Habit</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards - Accurate Zeroed Calculation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="nature-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-nature-600 dark:text-nature-400">
              Weekly Completion
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-nature-950 dark:text-white">
              {weeklyCompletionRate}%
            </span>
            <span className="text-xs text-nature-500">
              ({totalCompleted}/{totalScheduled} done)
            </span>
          </div>
          <div className="w-full bg-nature-200 dark:bg-nature-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-leaf h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${weeklyCompletionRate}%` }}
            />
          </div>
        </div>

        <div className="nature-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-nature-600 dark:text-nature-400">
              Current Streak
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-nature-950 dark:text-white">
              {currentStreak}
            </span>
            <span className="text-xs font-medium text-amber-600">Days</span>
          </div>
          <p className="text-xs text-nature-500">
            {currentStreak === 0 ? "Complete a task today to start your streak!" : "Streak active!"}
          </p>
        </div>

        <div className="nature-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-nature-600 dark:text-nature-400">
              Best Streak Record
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-nature-950 dark:text-white">
              {longestStreak}
            </span>
            <span className="text-xs font-medium text-blue-600">Days</span>
          </div>
          <p className="text-xs text-nature-500">Personal best consistency</p>
        </div>

        <div className="nature-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-nature-600 dark:text-nature-400">
              Productivity Index
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-nature-950 dark:text-white">
              {productivityScore}%
            </span>
          </div>
          <p className="text-xs text-nature-500">Overall task tracking score</p>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="nature-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-nature-400" />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-nature-200 dark:border-nature-800 bg-white/50 dark:bg-nature-900/50 text-xs focus:outline-none focus:ring-2 focus:ring-leaf"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-1">
            <Filter className="w-4 h-4 text-nature-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 rounded-xl border border-nature-200 dark:border-nature-800 bg-white/50 dark:bg-nature-900/50 text-xs focus:outline-none focus:ring-2 focus:ring-leaf"
            >
              <option value="ALL">All Categories</option>
              <option value="Health">Health</option>
              <option value="Fitness">Fitness</option>
              <option value="Mindfulness">Mindfulness</option>
              <option value="Learning">Learning</option>
              <option value="Productivity">Productivity</option>
            </select>
          </div>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              showArchived
                ? "bg-nature-800 text-white border-nature-800"
                : "border-nature-200 dark:border-nature-800 text-nature-700 dark:text-nature-300"
            }`}
          >
            {showArchived ? "View Active" : "View Archived"}
          </button>
        </div>
      </div>

      {/* 7-Day Habit Matrix Grid */}
      <div className="nature-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-nature-950 dark:text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-leaf" />
            <span>7-Day Habit Tracker Grid</span>
          </h2>
          <span className="text-xs text-nature-500 font-medium">
            {format(weekStart, "MMM dd")} - {format(addDays(weekStart, 6), "MMM dd, yyyy")}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-nature-500">Loading your habit matrix...</div>
        ) : filteredHabits.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-semibold text-nature-600 dark:text-nature-400">
              No habits found for this filter.
            </p>
            <button
              onClick={() => {
                setEditingHabit(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl nature-gradient text-white text-xs font-semibold shadow-sm inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Your First Habit</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-nature-200 dark:border-nature-800 text-xs font-bold text-nature-600 dark:text-nature-400 uppercase">
                  <th className="pb-3 w-64">Habit Name</th>
                  {weekDays.map((day, idx) => {
                    const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
                    return (
                      <th
                        key={idx}
                        className={`pb-3 text-center w-12 ${
                          isToday ? "text-leaf font-extrabold" : ""
                        }`}
                      >
                        <div>{format(day, "EEE")}</div>
                        <div className="text-[10px] font-normal">{format(day, "dd")}</div>
                      </th>
                    );
                  })}
                  <th className="pb-3 text-right">Weekly Rate</th>
                  <th className="pb-3 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nature-100 dark:divide-nature-900 text-sm">
                {filteredHabits.map((habit) => {
                  let habitDone = 0;
                  weekDays.forEach((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isDone = (habit.logs || []).some((l: any) => l.date === dateStr && l.completed);
                    if (isDone) habitDone++;
                  });
                  const habitRate = Math.round((habitDone / 7) * 100);

                  return (
                    <tr key={habit.id} className="hover:bg-nature-50/50 dark:hover:bg-nature-900/30">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-8 rounded-full"
                            style={{ backgroundColor: habit.color || "#3d9b6e" }}
                          />
                          <div>
                            <p className="font-bold text-nature-900 dark:text-nature-100 text-sm">
                              {habit.name}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-nature-500">
                              <span className="px-2 py-0.5 rounded-full bg-nature-100 dark:bg-nature-800 font-medium">
                                {habit.category}
                              </span>
                              <span>•</span>
                              <span>{habit.priority}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {weekDays.map((day, idx) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const isCompleted = (habit.logs || []).some(
                          (l: any) => l.date === dateStr && l.completed
                        );

                        return (
                          <td key={idx} className="py-4 text-center">
                            <button
                              onClick={() => handleToggleLog(habit.id, dateStr)}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                                isCompleted
                                  ? "nature-gradient text-white shadow-sm scale-105"
                                  : "border-2 border-nature-300 dark:border-nature-700 hover:border-leaf"
                              }`}
                            >
                              {isCompleted && <Check className="w-4 h-4" />}
                            </button>
                          </td>
                        );
                      })}

                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="font-bold text-xs text-nature-800 dark:text-nature-200">
                            {habitRate}%
                          </span>
                          <div className="w-16 bg-nature-200 dark:bg-nature-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-leaf h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${habitRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              setEditingHabit(habit);
                              setHabitForm({
                                name: habit.name,
                                description: habit.description || "",
                                category: habit.category || "Health",
                                color: habit.color || "#3d9b6e",
                                priority: habit.priority || "Medium",
                                recurrenceType: habit.recurrenceType || "daily",
                              });
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-nature-600 hover:bg-nature-100 dark:hover:bg-nature-800 transition-colors"
                            title="Edit Habit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleArchiveHabit(habit.id, !habit.archived)}
                            className="p-1.5 rounded-lg text-nature-600 hover:bg-nature-100 dark:hover:bg-nature-800 transition-colors"
                            title={habit.archived ? "Unarchive" : "Archive"}
                          >
                            {habit.archived ? (
                              <RotateCcw className="w-4 h-4" />
                            ) : (
                              <Archive className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Delete Habit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nature-card max-w-md w-full p-6 shadow-2xl space-y-6">
            <h3 className="text-xl font-extrabold text-nature-950 dark:text-white">
              {editingHabit ? "Edit Habit" : "Create New Habit"}
            </h3>

            <form onSubmit={handleSaveHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-nature-700 dark:text-nature-300">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  value={habitForm.name}
                  onChange={(e) => setHabitForm({ ...habitForm, name: e.target.value })}
                  placeholder="e.g. Drink 2L Water"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-nature-200 dark:border-nature-800 bg-white/50 dark:bg-nature-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-nature-700 dark:text-nature-300">
                  Description
                </label>
                <input
                  type="text"
                  value={habitForm.description}
                  onChange={(e) => setHabitForm({ ...habitForm, description: e.target.value })}
                  placeholder="e.g. Stay hydrated throughout the day"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-nature-200 dark:border-nature-800 bg-white/50 dark:bg-nature-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-leaf"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-nature-700 dark:text-nature-300">
                    Category
                  </label>
                  <select
                    value={habitForm.category}
                    onChange={(e) => setHabitForm({ ...habitForm, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-nature-200 dark:border-nature-800 bg-white/50 dark:bg-nature-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-leaf"
                  >
                    <option value="Health">Health</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Learning">Learning</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-nature-700 dark:text-nature-300">
                    Priority
                  </label>
                  <select
                    value={habitForm.priority}
                    onChange={(e) => setHabitForm({ ...habitForm, priority: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-nature-200 dark:border-nature-800 bg-white/50 dark:bg-nature-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-leaf"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-nature-100 dark:border-nature-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-nature-600 hover:bg-nature-100 dark:hover:bg-nature-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl nature-gradient text-white text-xs font-bold shadow-md hover:opacity-95"
                >
                  {editingHabit ? "Update Habit" : "Save Habit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
