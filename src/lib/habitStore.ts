"use client";

import { format, subDays } from "date-fns";

const todayStr = format(new Date(), "yyyy-MM-dd");
const d1 = format(subDays(new Date(), 1), "yyyy-MM-dd");
const d2 = format(subDays(new Date(), 2), "yyyy-MM-dd");
const d3 = format(subDays(new Date(), 3), "yyyy-MM-dd");
const d4 = format(subDays(new Date(), 4), "yyyy-MM-dd");

export const seedFullHabitsWithLogs = [
  { id: "h1", name: "Morning Meditation", description: "10 mins mindfulness and breathing exercises", category: "Mindfulness", icon: "Sparkles", color: "#3d9b6e", priority: "High", logs: [{ id: "log-1", date: todayStr, completed: true }, { id: "log-2", date: d1, completed: true }] },
  { id: "h2", name: "30-Min Workout", description: "Cardio or strength session", category: "Fitness", icon: "Dumbbell", color: "#2d7c56", priority: "High", logs: [{ id: "log-6", date: todayStr, completed: true }, { id: "log-7", date: d1, completed: true }] },
  { id: "h3", name: "Read 20 Pages", description: "Non-fiction book or articles", category: "Learning", icon: "BookOpen", color: "#64b78e", priority: "Medium", logs: [{ id: "log-10", date: todayStr, completed: true }] },
  { id: "h4", name: "Drink 2L Water", description: "Stay hydrated throughout the day", category: "Health", icon: "Droplets", color: "#52b788", priority: "High", logs: [{ id: "log-13", date: todayStr, completed: true }] },
  { id: "h5", name: "Weekly Financial Review", description: "Track expenses and adjust weekly budget", category: "Finance", icon: "DollarSign", color: "#768065", priority: "Medium", logs: [{ id: "log-17", date: d2, completed: true }] },
];

export const initialSampleHabits = seedFullHabitsWithLogs;

export function getBestUserHabits(userId: string): any[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return seedFullHabitsWithLogs;
  }

  try {
    const habitsMap = new Map<string, any>();

    // 1. Scan ALL localStorage keys for any habit arrays stored across sessions
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (
        key.startsWith("habithub_user_habits_") ||
        key === "habithub_master_backup" ||
        key.includes("habits")
      ) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((h: any) => {
              if (h && h.name) {
                // Key habit by normalized name so custom habits are never lost or duplicated
                const habitKey = h.name.toLowerCase().trim();
                if (!habitsMap.has(habitKey)) {
                  habitsMap.set(habitKey, h);
                } else {
                  // Merge logs between existing habit and found habit
                  const existing = habitsMap.get(habitKey);
                  const logsMap = new Map();
                  (existing.logs || []).forEach((l: any) => { if (l && l.date) logsMap.set(l.date, l); });
                  (h.logs || []).forEach((l: any) => { if (l && l.date) logsMap.set(l.date, l); });
                  habitsMap.set(habitKey, {
                    ...existing,
                    ...h,
                    logs: Array.from(logsMap.values()),
                  });
                }
              }
            });
          }
        } catch (e) {}
      }
    }

    const mergedList = Array.from(habitsMap.values());

    if (mergedList.length > 0) {
      if (userId) {
        localStorage.setItem(`habithub_user_habits_${userId}`, JSON.stringify(mergedList));
      }
      localStorage.setItem("habithub_master_backup", JSON.stringify(mergedList));
      return mergedList;
    }
  } catch (e) {
    console.error("Error reading habit store:", e);
  }

  if (userId) {
    localStorage.setItem(`habithub_user_habits_${userId}`, JSON.stringify(seedFullHabitsWithLogs));
  }
  return seedFullHabitsWithLogs;
}

export function saveUserHabits(userId: string, habits: any[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    if (userId) {
      localStorage.setItem(`habithub_user_habits_${userId}`, JSON.stringify(habits));
    }
    localStorage.setItem("habithub_master_backup", JSON.stringify(habits));
  } catch (e) {
    console.error("Error saving habit store:", e);
  }
}
