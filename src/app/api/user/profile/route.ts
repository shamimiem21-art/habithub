import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, theme, currentPassword, newPassword, emailEnabled, pushEnabled, reminderTime } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updateData: any = {};
    if (name) updateData.name = name;
    if (theme) updateData.theme = theme;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password required to update password" }, { status: 400 });
      }
      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, theme: true, role: true },
    });

    if (emailEnabled !== undefined || pushEnabled !== undefined || reminderTime !== undefined) {
      await db.notificationSetting.upsert({
        where: { userId },
        update: {
          emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
          pushEnabled: pushEnabled !== undefined ? pushEnabled : true,
          reminderTime: reminderTime || "20:00",
        },
        create: {
          userId,
          emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
          pushEnabled: pushEnabled !== undefined ? pushEnabled : true,
          reminderTime: reminderTime || "20:00",
        },
      });
    }

    return NextResponse.json({ user: updatedUser, message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("PUT Profile Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
