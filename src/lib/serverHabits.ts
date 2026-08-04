import { db, withTimeout } from "@/lib/db";
import { format, subDays } from "date-fns";

const todayStr = format(new Date(), "yyyy-MM-dd");
const d1 = format(subDays(new Date(), 1), "yyyy-MM-dd");
const d2 = format(subDays(new Date(), 2), "yyyy-MM-dd");
const d3 = format(subDays(new Date(), 3), "yyyy-MM-dd");
const d4 = format(subDays(new Date(), 4), "yyyy-MM-dd");
const d5 = format(subDays(new Date(), 5), "yyyy-MM-dd");
const d6 = format(subDays(new Date(), 6), "yyyy-MM-dd");

export const seed12HabitsWithLogs: any[] = [
  {
    id: "h1",
    name: "Morning Meditation",
    description: "10 mins mindfulness & deep breathing",
    category: "Mindfulness",
    icon: "Sparkles",
    color: "#3d9b6e",
    priority: "High",
    recurrenceType: "daily",
    archived: false,
    logs: [
      { id: "l1-1", date: todayStr, completed: true },
      { id: "l1-2", date: d1, completed: true },
      { id: "l1-3", date: d2, completed: true },
      { id: "l1-4", date: d3, completed: true },
      { id: "l1-5", date: d4, completed: true },
      { id: "l1-6", date: d5, completed: true },
      { id: "l1-7", date: d6, completed: true },
    ],
  },
  {
    id: "h2",
    name: "30-Min Workout",
    description: "Cardio or strength training session",
    category: "Fitness",
    icon: "Dumbbell",
    color: "#2d7c56",
    priority: "High",
    recurrenceType: "daily",
    archived: false,
    logs: [
      { id: "l2-1", date: todayStr, completed: true },
      { id: "l2-2", date: d1, completed: true },
      { id: "l2-3", date: d2, completed: true },
      { id: "l2-4", date: d3, completed: true },
      { id: "l2-5", date: d4, completed: true },
    ],
  },
  {
    id: "h3",
    name: "Read 20 Pages",
    description: "Non-fiction book or articles",
    category: "Learning",
    icon: "BookOpen",
    color: "#64b78e",
    priority: "Medium",
    recurrenceType: "daily",
    archived: false,
    logs: [
      { id: "l3-1", date: todayStr, completed: true },
      { id: "l3-2", date: d1, completed: true },
      { id: "l3-3", date: d2, completed: true },
      { id: "l3-4", date: d3, completed: true },
    ],
  },
  {
    id: "h4",
    name: "Drink 2L Water",
    description: "Stay hydrated throughout the day",
    category: "Health",
    icon: "Droplets",
    color: "#52b788",
    priority: "High",
    recurrenceType: "daily",
    archived: false,
    logs: [
      { id: "l4-1", date: todayStr, completed: true },
      { id: "l4-2", date: d1, completed: true },
      { id: "l4-3", date: d2, completed: true },
      { id: "l4-4", date: d3, completed: true },
      { id: "l4-5", date: d4, completed: true },
      { id: "l4-6", date: d5, completed: true },
    ],
  },
  {
    id: "h5",
    name: "Weekly Financial Review",
    description: "Track expenses and adjust budget",
    category: "Finance",
    icon: "DollarSign",
    color: "#768065",
    priority: "Medium",
    recurrenceType: "weekly",
    archived: false,
    logs: [
      { id: "l5-1", date: d2, completed: true },
    ],
  },
  {
    id: "h6",
    name: "Cold Shower Reset",
    description: "Boost alertness and circulation",
    category: "Health",
    icon: "Zap",
    color: "#3b82f6",
    priority: "Medium",
    recurrenceType: "daily",
    archived: false,
    logs: [
      { id: "l6-1", date: todayStr, completed: true },
      { id: "l6-2", date: d1, completed: true },
      { id: "l6-3", date: d2, completed: true },
    ],
  },
  {
    id: "h7",
    name: "Daily Journaling",
    description: "Reflect on accomplishments and goals",
    category: "Mindfulness",
    icon: "PenLine",
    color: "#8b5cf6",
    priority: "Medium",
    recurrenceType: "daily",
    archived: false,
    logs: [
      { id: "l7-1", date: todayStr, completed: true },
      { id: "l7-2", date: d1, completed: true },
      { id: "l7-3", date: d3, completed: true },
    ],
  },
  {
    id: "h8",
    name: "Code 1 Hour",
    description: "Build features & solve problems",
    category: "Productivity",
    icon: "Code",
    color: "#10b981",
    priority: "High",
    recurrenceType: "daily",
    archived: false,
    logs: [
      { id: "l8-1", date: todayStr, completed: true },
      { id: "l8-2", date: d1, completed: true },
      { id: "l8-3", date: d2, completed: true },
      { id: "l8-4", date: d3, completed: true },
      { id: "l8-5", date: d4, completed: true },
    ],
  },
  {
    id: "h9",
    name: "Evening Walk",
    description: "15-30 min outdoors walk",
    category: "Fitness",
    icon: "Footprints",
    color: "#f59e0b",
    priority: "Low",
    recurrenceType: "daily",
    archived: false,
    logs: [
      { id: "l9-1", date: todayStr, completed: true },
      { id: "l9-2", date: d2, completed: true },
    ],
  },
  {
    id: "h10",
    name: "No Sugar Challenge",
    description: "Avoid refined sugar & sodas",
    category: "Health",
    icon: "Apple",
    color: "#ef4444",
    priority: "High",
    recurrenceType: "daily",
    archived: false,
    logs: [
      { id: "l10-1", date: todayStr, completed: true },
      { id: "l10-2", date: d1, completed: true },
      { id: "l10-3", date: d2, completed: true },
      { id: "l10-4", date: d3, completed: true },
    ],
  },
  {
    id: "h11",
    name: "Sleep at 10:30 PM",
    description: "Consistent circadian rhythm",
    category: "Health",
    icon: "Moon",
    color: "#6366f1",
    priority: "High",
    recurrenceType: "daily",
    archived: false,
    logs: [
      { id: "l11-1", date: todayStr, completed: true },
      { id: "l11-2", date: d1, completed: true },
      { id: "l11-3", date: d2, completed: true },
    ],
  },
  {
    id: "h12",
    name: "Plan Next Day",
    description: "Outline 3 priority tasks for tomorrow",
    category: "Productivity",
    icon: "CheckSquare",
    color: "#ec4899",
    priority: "Medium",
    recurrenceType: "daily",
    archived: false,
    logs: [
      { id: "l12-1", date: todayStr, completed: true },
      { id: "l12-2", date: d1, completed: true },
      { id: "l12-3", date: d2, completed: true },
      { id: "l12-4", date: d3, completed: true },
    ],
  },
];

const globalServerHabitsStore = new Map<string, any[]>();

export async function getServerHabits(userId: string): Promise<any[]> {
  const cleanId = userId || "usr-shamimiem21gmailcom";

  if (globalServerHabitsStore.has(cleanId)) {
    const list = globalServerHabitsStore.get(cleanId);
    if (Array.isArray(list) && list.length > 0) return list;
  }

  if (db && typeof db.habit?.findMany === "function") {
    try {
      const dbHabits: any = await withTimeout(
        db.habit.findMany({
          where: { active: true },
          include: { logs: true },
          orderBy: { order: "asc" },
        }),
        null,
        500
      );

      if (dbHabits && Array.isArray(dbHabits) && dbHabits.length > 0) {
        const formatted = dbHabits.map((h: any) => ({
          id: h.id,
          name: h.name,
          description: h.description || "",
          category: h.category || "Health",
          icon: h.icon || "Sparkles",
          color: h.color || "#3d9b6e",
          priority: h.priority || "Medium",
          recurrenceType: h.recurrenceType || "daily",
          archived: h.archived || false,
          logs: (h.logs || []).map((l: any) => ({
            id: l.id,
            date: l.date,
            completed: l.completed,
          })),
        }));

        globalServerHabitsStore.set(cleanId, formatted);
        return formatted;
      }
    } catch (e) {}
  }

  globalServerHabitsStore.set(cleanId, seed12HabitsWithLogs);
  return seed12HabitsWithLogs;
}

export async function saveServerHabits(userId: string, habits: any[]): Promise<void> {
  const cleanId = userId || "usr-shamimiem21gmailcom";
  globalServerHabitsStore.set(cleanId, habits);
}
