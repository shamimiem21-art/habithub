import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateHabitStreak, getBadgesForStreak } from "@/lib/streak";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: habitId } = await params;
    const body = await req.json();
    const { userId, date, completed } = body;

    if (!userId || !date) {
      return NextResponse.json({ error: "Missing userId or date" }, { status: 400 });
    }

    const habit = await db.habit.findUnique({ where: { id: habitId } });
    if (!habit || habit.userId !== userId) {
      return NextResponse.json({ error: "Habit not found or unauthorized" }, { status: 404 });
    }

    // Toggle log status or upsert
    const existingLog = await db.habitLog.findUnique({
      where: { habitId_date: { habitId, date } },
    });

    let newStatus = completed !== undefined ? completed : !existingLog?.completed;

    const log = await db.habitLog.upsert({
      where: { habitId_date: { habitId, date } },
      update: {
        completed: newStatus,
        skipped: !newStatus,
      },
      create: {
        habitId,
        userId,
        date,
        completed: newStatus,
        skipped: !newStatus,
      },
    });

    // Automatically recalculate user's streaks & award new badges
    const allUserLogs = await db.habitLog.findMany({
      where: { userId },
      select: { date: true, completed: true },
    });

    const { currentStreak, longestStreak } = calculateHabitStreak(allUserLogs);
    const eligibleBadges = getBadgesForStreak(longestStreak);

    for (const badgeType of eligibleBadges) {
      await db.badge.upsert({
        where: { userId_badgeType: { userId, badgeType } },
        update: {},
        create: { userId, badgeType },
      });
    }

    return NextResponse.json({
      log,
      currentStreak,
      longestStreak,
      badgesAwarded: eligibleBadges,
    });
  } catch (error: any) {
    console.error("POST Log Error:", error);
    return NextResponse.json({ error: "Failed to toggle log" }, { status: 500 });
  }
}
