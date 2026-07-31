import { db } from "./db";
import bcrypt from "bcryptjs";

interface MemoryUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  theme: string;
  createdAt: Date;
}

interface MemoryHabit {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  priority: string;
  active: boolean;
  archived: boolean;
  order: number;
  recurrenceType: string;
  recurrenceDays: string;
  logs: { id: string; date: string; completed: boolean; skipped: boolean }[];
}

const memoryUsers: Map<string, MemoryUser> = new Map();
const memoryHabits: Map<string, MemoryHabit> = new Map();

let isInitialized = false;
async function ensureSeed() {
  if (isInitialized) return;
  isInitialized = true;

  let userPassword = "Password123!";
  let adminPassword = "AdminPassword123!";

  try {
    userPassword = await bcrypt.hash("Password123!", 10);
    adminPassword = await bcrypt.hash("AdminPassword123!", 10);
  } catch (e) {}

  const demoUser: MemoryUser = {
    id: "user-demo-id-123",
    name: "Alex Morgan",
    email: "user@habithub.app",
    passwordHash: userPassword,
    role: "USER",
    status: "ACTIVE",
    theme: "system",
    createdAt: new Date(),
  };

  const adminUser: MemoryUser = {
    id: "admin-demo-id-456",
    name: "System Admin",
    email: "admin@habithub.app",
    passwordHash: adminPassword,
    role: "ADMIN",
    status: "ACTIVE",
    theme: "system",
    createdAt: new Date(),
  };

  memoryUsers.set(demoUser.email, demoUser);
  memoryUsers.set(adminUser.email, adminUser);

  const sampleHabits = [
    { name: "Morning Meditation", category: "Mindfulness", icon: "Sparkles", color: "#3d9b6e", priority: "High" },
    { name: "30-Min Workout", category: "Fitness", icon: "Dumbbell", color: "#2d7c56", priority: "High" },
    { name: "Read 20 Pages", category: "Learning", icon: "BookOpen", color: "#64b78e", priority: "Medium" },
  ];

  sampleHabits.forEach((h, idx) => {
    const habitId = "habit-" + (idx + 1);
    memoryHabits.set(habitId, {
      id: habitId,
      userId: demoUser.id,
      name: h.name,
      description: "Sample daily habit",
      category: h.category,
      icon: h.icon,
      color: h.color,
      priority: h.priority,
      active: true,
      archived: false,
      order: idx + 1,
      recurrenceType: "daily",
      recurrenceDays: "0,1,2,3,4,5,6",
      logs: [],
    });
  });
}

export const dataStore = {
  async findUserByEmail(email: string) {
    const norm = (email || "").toLowerCase().trim();
    if (db && typeof db.user?.findUnique === "function") {
      try {
        const u = await db.user.findUnique({ where: { email: norm } });
        if (u) return u;
      } catch (e) {}
    }
    await ensureSeed();
    return memoryUsers.get(norm) || null;
  },

  async createUser(data: { name: string; email: string; passwordHash: string; role?: "USER" | "ADMIN" }) {
    const norm = data.email.toLowerCase().trim();
    if (db && typeof db.user?.create === "function") {
      try {
        const u = await db.user.create({
          data: {
            name: data.name,
            email: norm,
            passwordHash: data.passwordHash,
            role: data.role || "USER",
            status: "ACTIVE",
          },
        });
        return u;
      } catch (e) {}
    }

    await ensureSeed();
    const newUser: MemoryUser = {
      id: "usr-" + Math.random().toString(36).substring(2, 9),
      name: data.name,
      email: norm,
      passwordHash: data.passwordHash,
      role: data.role || "USER",
      status: "ACTIVE",
      theme: "system",
      createdAt: new Date(),
    };
    memoryUsers.set(norm, newUser);
    return newUser;
  },
};
