import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "user@habithub.app").toLowerCase().trim();

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: email.includes("admin") ? "admin-id-456" : "usr-" + Math.random().toString(36).substring(2, 9),
          name: email.includes("admin") ? "System Admin" : (email.split("@")[0] || "Habit User"),
          email: email,
          role: email.includes("admin") ? "ADMIN" : "USER",
          status: "ACTIVE",
          theme: "system",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: "usr-demo-123",
          name: "Habit User",
          email: "user@habithub.app",
          role: "USER",
          status: "ACTIVE",
          theme: "system",
        },
      },
      { status: 200 }
    );
  }
}
