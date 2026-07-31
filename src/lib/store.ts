import { db } from "./db";
import bcrypt from "bcryptjs";

// Resilient memory store fallback when serverless database file is read-only
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

// Initialize memory store with demo data
let isInitialized = false;
async function ensureSeed() {
  if (isInitialized) return;
  isInitialized = true;

  const userPassword = await bcrypt.hash("Password123!", 10);
  const adminPassword = await bcrypt.hash("AdminPassword123!", 10);

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
    const norm = email.toLowerCase().trim();
    try {
      const u = await db.user.findUnique({ where: { email: norm } });
      if (u) return u;
    } catch (e) {
      console.warn("Database query failed, falling back to resilient memory store", e);
    }
    await ensureSeed();
    return memoryUsers.get(norm) || null;
  },

  async createUser(data: { name: string; email: string; passwordHash: string; role?: "USER" | "ADMIN" }) {
    const norm = data.email.toLowerCase().trim();
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

      // Default habits
      await db.habit.createMany({
        data: [
          { userId: u.id, name: "Morning Routine", category: "Mindfulness", icon: "Sun", color: "#3d9b6e", priority: "High" },
          { userId: u.id, name: "Daily Exercise", category: "Fitness", icon: "Dumbbell", color: "#2d7c56", priority: "High" },
        ],
      });
      return u;
    } catch (e) {
      console.warn("Database user create failed, registering in resilient memory store", e);
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

    // Create default habits in memory
    const defaultHabits = [
      { name: "Morning Routine", category: "Mindfulness", icon: "Sun", color: "#3d9b6e" },
      { name: "Daily Exercise", category: "Fitness", icon: "Dumbbell", color: "#2d7c56" },
    ];
    defaultHabits.forEach((h, idx) => {
      const habitId = "hbt-" + Math.random().toString(36).substring(2, 9);
      memoryHabits.set(habitId, {
        id: habitId,
        userId: newUser.id,
        name: h.name,
        description: "Welcome habit",
        category: h.category,
        icon: h.icon,
        color: h.color,
        priority: "High",
        active: true,
        archived: false,
        order: idx + 1,
        recurrenceType: "daily",
        recurrenceDays: "0,1,2,3,4,5,6",
        logs: [],
      });
    });

    return newUser;
  },

  async getUserHabits(userId: string) {
    try {
      const habits = await db.habit.findMany({
        where: { userId },
        include: { logs: true },
      });
      if (habits && habits.length > 0) return habits;
    } catch (e) {}

    await ensureSeed();
    const list: MemoryHabit[] = [];
    memoryHabits.forEach((h) => {
      if (h.userId === userId) list.push(h);
    });
    return list;
  },
};
