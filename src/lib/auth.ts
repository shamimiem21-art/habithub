import bcrypt from "bcryptjs";
import { db } from "./db";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
}

export async function getUserById(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatar: true,
      theme: true,
      createdAt: true,
    },
  });
  return user;
}

export async function getUserByEmail(email: string) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  return user;
}
