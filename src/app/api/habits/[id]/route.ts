import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await db.habit.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    if (body.userId && existing.userId !== body.userId) {
      return NextResponse.json({ error: "Unauthorized access to habit" }, { status: 403 });
    }

    const updated = await db.habit.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : existing.name,
        description: body.description !== undefined ? body.description : existing.description,
        category: body.category !== undefined ? body.category : existing.category,
        icon: body.icon !== undefined ? body.icon : existing.icon,
        color: body.color !== undefined ? body.color : existing.color,
        priority: body.priority !== undefined ? body.priority : existing.priority,
        active: body.active !== undefined ? body.active : existing.active,
        archived: body.archived !== undefined ? body.archived : existing.archived,
        recurrenceType: body.recurrenceType !== undefined ? body.recurrenceType : existing.recurrenceType,
        recurrenceDays: body.recurrenceDays !== undefined ? body.recurrenceDays : existing.recurrenceDays,
        order: body.order !== undefined ? body.order : existing.order,
      },
    });

    return NextResponse.json({ habit: updated });
  } catch (error: any) {
    console.error("PUT Habit Error:", error);
    return NextResponse.json({ error: "Failed to update habit" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const existing = await db.habit.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    if (userId && existing.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized access to habit" }, { status: 403 });
    }

    await db.habit.delete({ where: { id } });
    return NextResponse.json({ message: "Habit deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Habit Error:", error);
    return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}
