"use client";

export const dynamic = "force-dynamic";

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
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { getBestUserHabits, saveUserHabits, initialSampleHabits, seed12HabitsWithLogs } from "@/lib/habitStore";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = Current Week, -1 = Previous Week, +1 = Next Week

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

  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState("");

  const handleSaveBulkHabits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !bulkInput.trim()) return;

    const titles = bulkInput.split("\n").map((t) => t.trim()).filter((t) => t.length > 0);
    if (titles.length === 0) return;

    const newHabits = titles.map((title, idx) => ({
      id: "hbt-" + Date.now() + "-" + idx,
      name: title,
      description: "Custom habit",
      category: habitForm.category || "Health",
      color: "#3d9b6e",
      priority: habitForm.priority || "Medium",
      recurrenceType: "daily",
      logs: [],
      archived: false,
    }));

    const updatedList = [...habits, ...newHabits];
    setHabits(updatedList);
    saveUserHabits(user.id, updatedList);

    setModalOpen(false);
    setIsBulkMode(false);
    setBulkInput("");
  };

  // Calculate 7 days of the selected week (Sun - Sat)
  const today = new Date();
  const baseWeekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekStart = addDays(baseWeekStart, weekOffset * 7);
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
    const recoveredHabits = getBestUserHabits(userId);
    setHabits(recoveredHabits);
  };

  const handleRestoreAllData = () => {
    if (!user) return;
    setHabits(seed12HabitsWithLogs);
    saveUserHabits(user.id, seed12HabitsWithLogs);
    alert("✅ All 12 habits, check-in logs, and active streaks restored successfully!");
  };

  const handleResetAllToZero = () => {
    if (!user) return;
    if (!confirm("Are you sure you want to reset all habit progress to 0?")) return;
    const resetHabits = habits.map((h) => ({ ...h, logs: [] }));
    setHabits(resetHabits);
    saveUserHabits(user.id, resetHabits);
    alert("All habits and streaks reset to 0!");
  };

  const handleClearAllBrowserCache = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      if (!confirm("Wipe all local habits, master backups, and cache from browser storage?")) return;
      localStorage.clear();
      alert("✅ All local storage wiped! Reloading page...");
      window.location.reload();
    }
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
    saveUserHabits(user.id, updatedHabits);
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
    saveUserHabits(user.id, updatedList);

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
  };

  const handleDeleteHabit = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this habit?")) return;
    const updatedList = habits.filter((h) => h.id !== id);
    setHabits(updatedList);
    saveUserHabits(user.id, updatedList);
  };

  const handleArchiveHabit = async (id: string, archived: boolean) => {
    if (!user) return;
    const updatedList = habits.map((h) => (h.id === id ? { ...h, archived } : h));
    setHabits(updatedList);
    saveUserHabits(user.id, updatedList);
  };

  // Metric calculations for the currently viewed week
  let totalScheduled = 0;
  let totalCompleted = 0;
  let totalAllTimeCompleted = 0;

  habits.forEach((h) => {
    (h.logs || []).forEach((l: any) => {
      if (l.completed) totalAllTimeCompleted++;
    });

    weekDays.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const log = (h.logs || []).find((l: any) => l.date === dateStr);
      totalScheduled++;
      if (log?.completed) totalCompleted++;
    });
  });

  const weeklyCompletionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  const currentStreak = totalAllTimeCompleted > 0 ? Math.round(totalAllTimeCompleted / Math.max(1, habits.length)) : 0;
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
            Track your daily tasks, navigate weeks, maintain streaks, and build habits.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRestoreAllData}
            className="px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center space-x-1"
            title="Restore full habit logs and active streaks"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Habits & Logs</span>
          </button>

          <button
            onClick={handleResetAllToZero}
            className="px-3 py-2 rounded-xl border border-red-300 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center space-x-1"
            title="Reset all habit progress to 0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Progress to 0</span>
          </button>

          <button
            onClick={handleClearAllBrowserCache}
            className="px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors flex items-center space-x-1"
            title="Wipe all local storage keys and hard reload"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Local Cache</span>
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

      {/* Summary KPI Cards */}
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
            {currentStreak === 0 ? "Complete a task to start your streak!" : "Active streak!"}
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

      {/* 7-Day Habit Matrix Grid with Full Week Navigation */}
      <div className="nature-card p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-nature-200 dark:border-nature-800">
          <div className="flex items-center space-x-3">
            <CheckSquare className="w-6 h-6 text-leaf" />
            <div>
              <h2 className="text-lg font-extrabold text-nature-950 dark:text-white">
                7-Day Habit Tracker Grid
              </h2>
              <p className="text-xs text-nature-500 font-medium">
                {format(weekStart, "MMM dd")} - {format(addDays(weekStart, 6), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {/* Week Navigation Controls */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-2 rounded-xl border border-nature-300 dark:border-nature-700 text-nature-700 dark:text-nature-300 hover:bg-nature-100 dark:hover:bg-nature-800 transition-colors flex items-center space-x-1 text-xs font-semibold"
              title="Navigate to Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden md:inline">Previous Week</span>
            </button>

            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="px-3 py-2 rounded-xl nature-gradient text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all"
              >
                This Week
              </button>
            )}

            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-2 rounded-xl border border-nature-300 dark:border-nature-700 text-nature-700 dark:text-nature-300 hover:bg-nature-100 dark:hover:bg-nature-800 transition-colors flex items-center space-x-1 text-xs font-semibold"
              title="Navigate to Next Week"
            >
              <span className="hidden md:inline">Next Week</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredHabits.length === 0 ? (
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

            {!editingHabit && (
              <div className="flex items-center space-x-2 border-b border-nature-200 dark:border-nature-800 pb-3">
                <button
                  type="button"
                  onClick={() => setIsBulkMode(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    !isBulkMode ? "bg-leaf text-white" : "text-nature-600 hover:bg-nature-100 dark:hover:bg-nature-800"
                  }`}
                >
                  Single Habit
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkMode(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    isBulkMode ? "bg-leaf text-white" : "text-nature-600 hover:bg-nature-100 dark:hover:bg-nature-800"
                  }`}
                >
                  Bulk Add 10+ Habits
                </button>
              </div>
            )}

            {isBulkMode && !editingHabit ? (
              <form onSubmit={handleSaveBulkHabits} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-nature-700 dark:text-nature-300">
                    Paste Habit Names (One per line)
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder={"Morning Yoga\nDrink 3L Water\nRead Book\nCold Shower\nJournaling\nCoding 1hr\nWalk Dog\nMeditation\nNo Sugar\nSleep at 10PM"}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-nature-200 dark:border-nature-800 bg-white/50 dark:bg-nature-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-leaf font-mono"
                  />
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
                    Add All Habits Instantly
                  </button>
                </div>
              </form>
            ) : (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
