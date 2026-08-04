"use client";

import { seed12HabitsWithLogs } from "@/lib/serverHabits";

export const initialSampleHabits = seed12HabitsWithLogs;
export { seed12HabitsWithLogs };

export function getBestUserHabits(userId: string): any[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return seed12HabitsWithLogs;
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
                const habitKey = h.name.toLowerCase().trim();
                if (!habitsMap.has(habitKey)) {
                  habitsMap.set(habitKey, h);
                } else {
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

    // Always ensure all 12 core habits are present in mergedList if missing
    seed12HabitsWithLogs.forEach((seedH) => {
      const seedKey = seedH.name.toLowerCase().trim();
      if (!habitsMap.has(seedKey)) {
        mergedList.push(seedH);
      }
    });

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
    localStorage.setItem(`habithub_user_habits_${userId}`, JSON.stringify(seed12HabitsWithLogs));
  }
  return seed12HabitsWithLogs;
}

export function saveUserHabits(userId: string, habits: any[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    if (userId) {
      localStorage.setItem(`habithub_user_habits_${userId}`, JSON.stringify(habits));
    }
    localStorage.setItem("habithub_master_backup", JSON.stringify(habits));

    // Also sync to server endpoint asynchronously
    fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, habits }),
    }).catch(() => {});
  } catch (e) {
    console.error("Error saving habit store:", e);
  }
}
