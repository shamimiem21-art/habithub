import { format, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

export interface LogEntry {
  date: string;
  completed: boolean;
}

export function calculateHabitStreak(logs: LogEntry[]) {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date)
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  
  // Calculate current streak backward from today or yesterday
  let checkDate = today;
  let todayStr = format(checkDate, "yyyy-MM-dd");

  if (!completedDates.has(todayStr)) {
    // Check if completed yesterday to keep streak active
    checkDate = subDays(today, 1);
    todayStr = format(checkDate, "yyyy-MM-dd");
  }

  while (completedDates.has(todayStr)) {
    currentStreak++;
    checkDate = subDays(checkDate, 1);
    todayStr = format(checkDate, "yyyy-MM-dd");
  }

  // Calculate longest streak across all logs sorted by date
  const sortedDates = Array.from(completedDates).sort();
  if (sortedDates.length > 0) {
    let streakCount = 1;
    longestStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = parseISO(sortedDates[i - 1]);
      const curr = parseISO(sortedDates[i]);
      const diffInDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
      if (diffInDays === 1) {
        streakCount++;
      } else {
        streakCount = 1;
      }
      if (streakCount > longestStreak) {
        longestStreak = streakCount;
      }
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}

export function getBadgesForStreak(longestStreak: number): string[] {
  const badges: string[] = [];
  if (longestStreak >= 7) badges.push("STREAK_7");
  if (longestStreak >= 30) badges.push("STREAK_30");
  if (longestStreak >= 90) badges.push("STREAK_90");
  if (longestStreak >= 180) badges.push("STREAK_180");
  if (longestStreak >= 365) badges.push("STREAK_365");
  return badges;
}

export const BADGE_DETAILS: Record<string, { title: string; description: string; icon: string; color: string }> = {
  STREAK_7: { title: "7-Day Spark", description: "Maintained a 7-day consistency streak!", icon: "Flame", color: "from-amber-400 to-orange-500" },
  STREAK_30: { title: "30-Day Pioneer", description: "Built a solid habit for 30 consecutive days!", icon: "Award", color: "from-emerald-400 to-teal-600" },
  STREAK_90: { title: "90-Day Master", description: "Mastered consistency over 90 continuous days!", icon: "ShieldCheck", color: "from-blue-500 to-indigo-600" },
  STREAK_180: { title: "180-Day Legend", description: "Half a year of uninterrupted dedication!", icon: "Zap", color: "from-purple-500 to-pink-600" },
  STREAK_365: { title: "365-Day Titan", description: "A full year of relentless perfection!", icon: "Crown", color: "from-amber-300 via-yellow-400 to-amber-600" },
};
