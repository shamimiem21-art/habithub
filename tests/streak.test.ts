import { describe, it, expect } from "vitest";
import { calculateHabitStreak, getBadgesForStreak } from "../src/lib/streak";

describe("HabitHub Streak Calculation", () => {
  it("calculates current and longest streak correctly for continuous logs", () => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    const logs = [
      { date: formatDate(today), completed: true },
      { date: formatDate(new Date(Date.now() - 86400000 * 1)), completed: true },
      { date: formatDate(new Date(Date.now() - 86400000 * 2)), completed: true },
      { date: formatDate(new Date(Date.now() - 86400000 * 3)), completed: true },
      { date: formatDate(new Date(Date.now() - 86400000 * 4)), completed: true },
      { date: formatDate(new Date(Date.now() - 86400000 * 5)), completed: true },
      { date: formatDate(new Date(Date.now() - 86400000 * 6)), completed: true },
    ];

    const { currentStreak, longestStreak } = calculateHabitStreak(logs);
    expect(currentStreak).toBe(7);
    expect(longestStreak).toBe(7);
  });

  it("awards milestone badges based on streak milestones", () => {
    expect(getBadgesForStreak(7)).toContain("STREAK_7");
    expect(getBadgesForStreak(30)).toContain("STREAK_30");
    expect(getBadgesForStreak(90)).toContain("STREAK_90");
    expect(getBadgesForStreak(180)).toContain("STREAK_180");
    expect(getBadgesForStreak(365)).toContain("STREAK_365");
  });
});
