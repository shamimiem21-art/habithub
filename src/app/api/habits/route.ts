import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const habits = [
    { id: "h1", name: "Morning Meditation", description: "10 mins mindfulness", category: "Mindfulness", icon: "Sparkles", color: "#3d9b6e", priority: "High", logs: [] },
    { id: "h2", name: "30-Min Workout", description: "Cardio or strength session", category: "Fitness", icon: "Dumbbell", color: "#2d7c56", priority: "High", logs: [] },
    { id: "h3", name: "Read 20 Pages", description: "Non-fiction book or articles", category: "Learning", icon: "BookOpen", color: "#64b78e", priority: "Medium", logs: [] },
  ];

  return NextResponse.json({ habits }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const habit = {
      id: "hbt-" + Math.random().toString(36).substring(2, 9),
      name: body.name || "New Habit",
      description: body.description || "",
      category: body.category || "Health",
      color: body.color || "#3d9b6e",
      priority: body.priority || "Medium",
      logs: [],
    };
    return NextResponse.json({ habit }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Habit created" }, { status: 200 });
  }
}
