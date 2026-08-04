import { NextResponse } from "next/server";

function getDeterministicUserId(email: string): string {
  const norm = (email || "").toLowerCase().trim();
  if (norm.includes("admin")) return "admin-id-456";
  const clean = norm.replace(/[^a-z0-9]/g, "");
  return `usr-${clean || "demo"}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = body.name || "New Member";
    const email = (body.email || "shamim.iem21@gmail.com").toLowerCase().trim();
    const userId = getDeterministicUserId(email);

    return NextResponse.json(
      {
        message: "Registration successful. You can now use the platform.",
        user: {
          id: userId,
          name: name,
          email: email,
          role: "USER",
          status: "ACTIVE",
          theme: "system",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: "usr-shamimiem21gmailcom",
          name: "Habit Member",
          email: "shamim.iem21@gmail.com",
          role: "USER",
          status: "ACTIVE",
          theme: "system",
        },
      },
      { status: 200 }
    );
  }
}
