import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: "USER",
        status: "ACTIVE",
        notificationSetting: {
          create: {
            emailEnabled: true,
            pushEnabled: true,
            reminderTime: "20:00",
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Create default welcome habits
    const defaultHabits = [
      { name: "Morning Routine", category: "Mindfulness", icon: "Sun", color: "#3d9b6e", priority: "High" },
      { name: "Daily Exercise", category: "Fitness", icon: "Dumbbell", color: "#2d7c56", priority: "High" },
      { name: "Read 15 Mins", category: "Learning", icon: "BookOpen", color: "#64b78e", priority: "Medium" },
    ];

    for (let i = 0; i < defaultHabits.length; i++) {
      await db.habit.create({
        data: {
          userId: user.id,
          ...defaultHabits[i],
          order: i + 1,
        },
      });
    }

    return NextResponse.json({
      message: "Registration successful. You can now use the platform.",
      user,
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
