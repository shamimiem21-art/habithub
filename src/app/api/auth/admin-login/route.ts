import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

const adminLoginSchema = z.object({
  email: z.string().email("Invalid admin email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Elevated administrative credentials required." },
        { status: 403 }
      );
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Admin account suspended." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    // Log admin access in system telemetry
    await db.systemLog.create({
      data: {
        level: "SECURITY",
        message: `Admin ${user.email} authenticated to admin panel.`,
      },
    });

    const adminUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return NextResponse.json({
      message: "Admin authentication successful",
      user: adminUser,
    });
  } catch (error: any) {
    console.error("Admin Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error during admin login" },
      { status: 500 }
    );
  }
}
