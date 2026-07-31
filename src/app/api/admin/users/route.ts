import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

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

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: { habits: true, habitLogs: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Admin GET Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { adminId, targetUserId, action, newPassword } = body;

    if (!adminId) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 401 });
    }

    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    if (action === "SUSPEND") {
      await db.user.update({
        where: { id: targetUserId },
        data: { status: "SUSPENDED" },
      });
      await db.systemLog.create({
        data: { level: "WARN", message: `Admin ${admin.email} suspended user ${targetUserId}` },
      });
      return NextResponse.json({ message: "User suspended successfully" });
    }

    if (action === "REACTIVATE") {
      await db.user.update({
        where: { id: targetUserId },
        data: { status: "ACTIVE" },
      });
      return NextResponse.json({ message: "User reactivated successfully" });
    }

    if (action === "RESET_PASSWORD" && newPassword) {
      const passwordHash = await hashPassword(newPassword);
      await db.user.update({
        where: { id: targetUserId },
        data: { passwordHash },
      });
      return NextResponse.json({ message: "User password reset successfully" });
    }

    if (action === "DELETE") {
      await db.user.delete({ where: { id: targetUserId } });
      return NextResponse.json({ message: "User deleted successfully" });
    }

    return NextResponse.json({ error: "Invalid admin action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin Action Error:", error);
    return NextResponse.json({ error: "Failed to execute admin action" }, { status: 500 });
  }
}
