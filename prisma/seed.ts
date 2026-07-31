import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { format, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with demo users, admin, habits, and logs...");

  const userPassword = await bcrypt.hash("Password123!", 10);
  const adminPassword = await bcrypt.hash("AdminPassword123!", 10);

  // 1. Create Normal User
  const demoUser = await prisma.user.upsert({
    where: { email: "user@habithub.app" },
    update: {},
    create: {
      name: "Alex Morgan",
      email: "user@habithub.app",
      passwordHash: userPassword,
      role: "USER",
      status: "ACTIVE",
      theme: "system",
      notificationSetting: {
        create: {
          emailEnabled: true,
          pushEnabled: true,
          reminderTime: "20:00",
        },
      },
    },
  });

  // 2. Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@habithub.app" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@habithub.app",
      passwordHash: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      theme: "system",
    },
  });

  // 3. Create Sample Habits for Demo User
  const sampleHabits = [
    {
      name: "Morning Meditation",
      description: "10 minutes of mindfulness and breathing exercises",
      category: "Mindfulness",
      icon: "Sparkles",
      color: "#3d9b6e",
      priority: "High",
      order: 1,
      recurrenceType: "daily",
      recurrenceDays: "0,1,2,3,4,5,6",
    },
    {
      name: "30-Min Workout",
      description: "Strength training or cardio session",
      category: "Fitness",
      icon: "Dumbbell",
      color: "#2d7c56",
      priority: "High",
      order: 2,
      recurrenceType: "daily",
      recurrenceDays: "0,1,2,3,4,5,6",
    },
    {
      name: "Read 20 Pages",
      description: "Read non-fiction book or industry articles",
      category: "Learning",
      icon: "BookOpen",
      color: "#64b78e",
      priority: "Medium",
      order: 3,
      recurrenceType: "daily",
      recurrenceDays: "0,1,2,3,4,5,6",
    },
    {
      name: "Drink 2L Water",
      description: "Stay hydrated throughout the day",
      category: "Health",
      icon: "Droplets",
      color: "#52b788",
      priority: "High",
      order: 4,
      recurrenceType: "daily",
      recurrenceDays: "0,1,2,3,4,5,6",
    },
    {
      name: "Weekly Financial Review",
      description: "Track expenses and adjust weekly budget",
      category: "Finance",
      icon: "DollarSign",
      color: "#768065",
      priority: "Medium",
      order: 5,
      recurrenceType: "weekly",
      recurrenceDays: "0", // Sunday
    },
  ];

  for (const h of sampleHabits) {
    const habit = await prisma.habit.create({
      data: {
        userId: demoUser.id,
        ...h,
      },
    });

    // Generate historical logs for the last 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = subDays(today, i);
      const dateStr = format(d, "yyyy-MM-dd");
      
      // Simulate ~85% completion rate for realistic streaks
      const isCompleted = (i % 7 !== 3); 
      await prisma.habitLog.create({
        data: {
          habitId: habit.id,
          userId: demoUser.id,
          date: dateStr,
          completed: isCompleted,
          skipped: !isCompleted,
        },
      });
    }
  }

  // 4. Create Badges for Demo User
  await prisma.badge.upsert({
    where: { userId_badgeType: { userId: demoUser.id, badgeType: "STREAK_7" } },
    update: {},
    create: { userId: demoUser.id, badgeType: "STREAK_7" },
  });
  await prisma.badge.upsert({
    where: { userId_badgeType: { userId: demoUser.id, badgeType: "STREAK_30" } },
    update: {},
    create: { userId: demoUser.id, badgeType: "STREAK_30" },
  });

  // 5. Create System Announcements
  await prisma.announcement.create({
    data: {
      title: "Welcome to HabitHub!",
      content: "Track your habits, build streaks, and view detailed weekly/monthly reports.",
      targetRole: "ALL",
    },
  });

  console.log("Database successfully seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
