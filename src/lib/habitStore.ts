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

    // 1. Check exact user habit key first
    const exactUserKey = `habithub_user_habits_${cleanId}`;
    const userRaw = localStorage.getItem(exactUserKey);
    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        if (Array.isArray(parsed)) {
          return parsed; // Return user's exact current list (honors deletions!)
        }
      } catch (e) {}
    }

    // 2. Check master backup key
    const masterRaw = localStorage.getItem("habithub_master_backup");
    if (masterRaw) {
      try {
        const parsed = JSON.parse(masterRaw);
        if (Array.isArray(parsed)) {
          localStorage.setItem(exactUserKey, JSON.stringify(parsed));
          return parsed;
        }
      } catch (e) {}
    }

    // 3. Check any older habithub_user_habits_ key
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("habithub_user_habits_")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              localStorage.setItem(exactUserKey, JSON.stringify(parsed));
              localStorage.setItem("habithub_master_backup", JSON.stringify(parsed));
              return parsed;
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    console.error("Error reading habit store:", e);
  }

  // 4. Default: Seed initial 12 habits only on very first launch
  if (userId) {
    localStorage.setItem(`habithub_user_habits_${userId}`, JSON.stringify(seed12HabitsWithLogs));
  }
  localStorage.setItem("habithub_master_backup", JSON.stringify(seed12HabitsWithLogs));
  return seed12HabitsWithLogs;
}

export function saveUserHabits(userId: string, habits: any[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const cleanId = userId || "usr-shamimiem21gmailcom";
    localStorage.setItem(`habithub_user_habits_${cleanId}`, JSON.stringify(habits));
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
