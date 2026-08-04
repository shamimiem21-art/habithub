"use client";

import { format, subDays } from "date-fns";

const todayStr = format(new Date(), "yyyy-MM-dd");
const d1 = format(subDays(new Date(), 1), "yyyy-MM-dd");
const d2 = format(subDays(new Date(), 2), "yyyy-MM-dd");
const d3 = format(subDays(new Date(), 3), "yyyy-MM-dd");
const d4 = format(subDays(new Date(), 4), "yyyy-MM-dd");

export const seedFullHabitsWithLogs = [
  {
    id: "h1",
    name: "Morning Meditation",
    description: "10 mins mindfulness and breathing exercises",
    category: "Mindfulness",
    icon: "Sparkles",
    color: "#3d9b6e",
    priority: "High",
    logs: [
      { id: "log-1", date: todayStr, completed: true },
      { id: "log-2", date: d1, completed: true },
      { id: "log-3", date: d2, completed: true },
      { id: "log-4", date: d3, completed: true },
      { id: "log-5", date: d4, completed: true },
    ],
  },
  {
    id: "h2",
    name: "30-Min Workout",
    description: "Cardio or strength session",
    category: "Fitness",
    icon: "Dumbbell",
    color: "#2d7c56",
    priority: "High",
    logs: [
      { id: "log-6", date: todayStr, completed: true },
      { id: "log-7", date: d1, completed: true },
      { id: "log-8", date: d2, completed: true },
      { id: "log-9", date: d3, completed: true },
    ],
  },
  {
    id: "h3",
    name: "Read 20 Pages",
    description: "Non-fiction book or articles",
    category: "Learning",
    icon: "BookOpen",
    color: "#64b78e",
    priority: "Medium",
    logs: [
      { id: "log-10", date: todayStr, completed: true },
      { id: "log-11", date: d1, completed: true },
      { id: "log-12", date: d2, completed: true },
    ],
  },
  {
    id: "h4",
    name: "Drink 2L Water",
    description: "Stay hydrated throughout the day",
    category: "Health",
    icon: "Droplets",
    color: "#52b788",
    priority: "High",
    logs: [
      { id: "log-13", date: todayStr, completed: true },
      { id: "log-14", date: d1, completed: true },
      { id: "log-15", date: d2, completed: true },
      { id: "log-16", date: d3, completed: true },
    ],
  },
  {
    id: "h5",
    name: "Weekly Financial Review",
    description: "Track expenses and adjust weekly budget",
    category: "Finance",
    icon: "DollarSign",
    color: "#768065",
    priority: "Medium",
    logs: [
      { id: "log-17", date: d2, completed: true },
    ],
  },
];

export const initialSampleHabits = seedFullHabitsWithLogs;

export function getBestUserHabits(userId: string): any[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return seedFullHabitsWithLogs;
  }

  try {
    let bestList: any[] = [];
    let highestScore = -1;

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
            let completedLogsCount = 0;
            let customHabitsCount = 0;

            parsed.forEach((h: any) => {
              if (Array.isArray(h.logs)) {
                h.logs.forEach((l: any) => {
                  if (l && l.completed) completedLogsCount++;
                });
              }
              if (h.id && !["h1", "h2", "h3", "h4", "h5"].includes(h.id)) {
                customHabitsCount++;
              }
            });

            const score = completedLogsCount * 10 + customHabitsCount * 5 + parsed.length;

            if (score > highestScore) {
              highestScore = score;
              bestList = parsed;
            }
          }
        } catch (e) {}
      }
    }

    if (bestList.length > 0 && highestScore > 0) {
      if (userId) {
        localStorage.setItem(`habithub_user_habits_${userId}`, JSON.stringify(bestList));
      }
      localStorage.setItem("habithub_master_backup", JSON.stringify(bestList));
      return bestList;
    }
  } catch (e) {
    console.error("Error reading habit store:", e);
  }

  // If no previous logs exist, seed with full active habit dataset
  if (userId) {
    localStorage.setItem(`habithub_user_habits_${userId}`, JSON.stringify(seedFullHabitsWithLogs));
  }
  localStorage.setItem("habithub_master_backup", JSON.stringify(seedFullHabitsWithLogs));
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
