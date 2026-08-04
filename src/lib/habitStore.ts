"use client";

export const initialSampleHabits = [
  { id: "h1", name: "Morning Meditation", description: "10 mins mindfulness", category: "Mindfulness", icon: "Sparkles", color: "#3d9b6e", priority: "High", logs: [] },
  { id: "h2", name: "30-Min Workout", description: "Cardio or strength session", category: "Fitness", icon: "Dumbbell", color: "#2d7c56", priority: "High", logs: [] },
  { id: "h3", name: "Read 20 Pages", description: "Non-fiction book or articles", category: "Learning", icon: "BookOpen", color: "#64b78e", priority: "Medium", logs: [] },
];

export function getBestUserHabits(userId: string): any[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return initialSampleHabits;
  }

  try {
    let bestList: any[] = [];
    let highestScore = -1;

    // Scan all keys in localStorage for habit data
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
              if (h.id && !["h1", "h2", "h3"].includes(h.id)) {
                customHabitsCount++;
              }
            });

            // Score calculation: Give high priority to lists with completed check-ins & custom habits
            const score = completedLogsCount * 10 + customHabitsCount * 5 + parsed.length;

            if (score > highestScore) {
              highestScore = score;
              bestList = parsed;
            }
          }
        } catch (e) {}
      }
    }

    if (bestList.length > 0) {
      if (userId) {
        localStorage.setItem(`habithub_user_habits_${userId}`, JSON.stringify(bestList));
      }
      localStorage.setItem("habithub_master_backup", JSON.stringify(bestList));
      return bestList;
    }
  } catch (e) {
    console.error("Error reading habit store:", e);
  }

  // Fallback to sample habits if no data exists
  if (userId) {
    localStorage.setItem(`habithub_user_habits_${userId}`, JSON.stringify(initialSampleHabits));
  }
  localStorage.setItem("habithub_master_backup", JSON.stringify(initialSampleHabits));
  return initialSampleHabits;
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
