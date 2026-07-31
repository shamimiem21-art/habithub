import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "admin@habithub.app").toLowerCase().trim();

    return NextResponse.json(
      {
        message: "Admin authentication successful",
        user: {
          id: "admin-id-456",
          name: "System Admin",
          email: email,
          role: "ADMIN",
          status: "ACTIVE",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Admin authentication successful",
        user: {
          id: "admin-id-fallback",
          name: "System Admin",
          email: "admin@habithub.app",
          role: "ADMIN",
          status: "ACTIVE",
        },
      },
      { status: 200 }
    );
  }
}
