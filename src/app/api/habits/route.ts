import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createHabitSchema = z.object({
  userId: z.string().min(1, "User ID required"),
  name: z.string().min(1, "Habit name is required"),
  description: z.string().optional(),
  category: z.string().default("Health"),
  icon: z.string().default("CheckCircle"),
  color: z.string().default("#3d9b6e"),
  priority: z.string().default("Medium"),
  recurrenceType: z.string().default("daily"),
  recurrenceDays: z.string().default("0,1,2,3,4,5,6"),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const includeArchived = searchParams.get("archived") === "true";

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Missing userId" }, { status: 401 });
    }

    const habits = await db.habit.findMany({
      where: {
        userId,
        archived: includeArchived ? undefined : false,
      },
      include: {
        logs: {
          select: {
            id: true,
            date: true,
            completed: true,
            skipped: true,
            note: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ habits });
  } catch (error: any) {
    console.error("GET Habits Error:", error);
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createHabitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;

    // Count existing habits for user to set order
    const habitCount = await db.habit.count({
      where: { userId: data.userId },
    });

    const habit = await db.habit.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description || "",
        category: data.category,
        icon: data.icon,
        color: data.color,
        priority: data.priority,
        recurrenceType: data.recurrenceType,
        recurrenceDays: data.recurrenceDays,
        order: habitCount + 1,
      },
    });

    return NextResponse.json({ habit });
  } catch (error: any) {
    console.error("POST Habit Error:", error);
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}
