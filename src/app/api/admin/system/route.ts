import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    if (!adminId) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 401 });
    }

    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const totalUsers = await db.user.count();
    const activeUsers = await db.user.count({ where: { status: "ACTIVE" } });
    const suspendedUsers = await db.user.count({ where: { status: "SUSPENDED" } });
    const totalHabits = await db.habit.count();
    const totalCheckins = await db.habitLog.count({ where: { completed: true } });

    const logs = await db.systemLog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    const announcements = await db.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalHabits,
        totalCheckins,
      },
      logs,
      announcements,
    });
  } catch (error: any) {
    console.error("Admin GET System Error:", error);
    return NextResponse.json({ error: "Failed to fetch system data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { adminId, title, content } = body;

    if (!adminId) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 401 });
    }

    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const announcement = await db.announcement.create({
      data: { title, content, targetRole: "ALL" },
    });

    return NextResponse.json({ announcement, message: "Announcement published" });
  } catch (error: any) {
    console.error("Admin POST System Error:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
