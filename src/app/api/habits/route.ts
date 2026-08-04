import { NextResponse } from "next/server";
import { getServerHabits, saveServerHabits } from "@/lib/serverHabits";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr-shamimiem21gmailcom";
    const habits = await getServerHabits(userId);
    return NextResponse.json({ habits }, { status: 200 });
  } catch (e) {
    const habits = await getServerHabits("usr-shamimiem21gmailcom");
    return NextResponse.json({ habits }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || "usr-shamimiem21gmailcom";
    let habits = await getServerHabits(userId);

    if (Array.isArray(body.habits)) {
      habits = body.habits;
    } else if (body.name) {
      const newHabit = {
        id: "hbt-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        name: body.name,
        description: body.description || "",
        category: body.category || "Health",
        color: body.color || "#3d9b6e",
        priority: body.priority || "Medium",
        recurrenceType: body.recurrenceType || "daily",
        archived: false,
        logs: [],
      };
      habits.push(newHabit);
    }

    await saveServerHabits(userId, habits);
    return NextResponse.json({ habits, message: "Habits updated successfully" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Habits updated" }, { status: 200 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
