"use client";

import { seed12HabitsWithLogs } from "@/lib/serverHabits";

export const initialSampleHabits = seed12HabitsWithLogs;
export { seed12HabitsWithLogs };

export function getBestUserHabits(userId: string): any[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return seed12HabitsWithLogs;
  }

  try {
    const cleanId = userId || "usr-shamimiem21gmailcom";
    const exactUserKey = `habithub_user_habits_${cleanId}`;
    const initKey = `habithub_initialized_${cleanId}`;

    // 1. If user store is initialized or exact key exists, return user list (honors deletions 100%)
    if (localStorage.getItem(initKey) === "true" || localStorage.getItem(exactUserKey) !== null) {
      const userRaw = localStorage.getItem(exactUserKey);
      if (userRaw !== null) {
        try {
          const parsed = JSON.parse(userRaw);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (e) {}
      }
    }

    // 2. First-time initialization for new user: Seed 12 habits ONCE
    localStorage.setItem(exactUserKey, JSON.stringify(seed12HabitsWithLogs));
    localStorage.setItem(initKey, "true");
    localStorage.setItem("habithub_master_backup", JSON.stringify(seed12HabitsWithLogs));
    return seed12HabitsWithLogs;
  } catch (e) {
    console.error("Error reading habit store:", e);
  }

  return seed12HabitsWithLogs;
}

export function saveUserHabits(userId: string, habits: any[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const cleanId = userId || "usr-shamimiem21gmailcom";
    const exactUserKey = `habithub_user_habits_${cleanId}`;
    const initKey = `habithub_initialized_${cleanId}`;

    localStorage.setItem(exactUserKey, JSON.stringify(habits));
    localStorage.setItem(initKey, "true");
    localStorage.setItem("habithub_master_backup", JSON.stringify(habits));

    // Async sync to server endpoint
    fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: cleanId, habits }),
    }).catch(() => {});
  } catch (e) {
    console.error("Error saving habit store:", e);
  }
}
