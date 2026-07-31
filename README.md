# 🌱 HabitHub - Production SaaS Habit & Daily Task Tracking Platform

HabitHub is a complete, multi-user habit tracking platform featuring private user data isolation, streak management, interactive habit matrix tables, automated weekly & monthly performance reports, custom analytics, Web Push notifications, an isolated admin control panel, and a plug-in expansion module architecture.

---

## 🌟 Key Features

- **Nature-Inspired UI**: Soft green, mint, sage, and forest palette with glassmorphism cards, dark/light mode toggle, and smooth Framer Motion micro-animations.
- **Private Data Isolation**: Strict user data isolation enforced at API, database, and UI levels.
- **7-Day Habit Matrix Grid**: Interactive weekly habit table (Sunday – Saturday) with instant state updates, weekly completion progress, and recurrence rules.
- **Streak Engine & Milestone Badges**: Automatic current & longest streak calculation, perfect week/month detection, and milestone badges (7, 30, 90, 180, 365 days).
- **Dedicated Reports Module (`/reports`)**: Weekly & Monthly performance reports, completion %, best/worst/most skipped habits, category breakdown, productivity score, and export capabilities (PDF, Print, PNG/SVG charts).
- **Interactive Analytics & Heatmaps (`/analytics`)**: 14-day completion area trends, 90-day consistency heatmaps, and category distribution bar charts.
- **Historical Calendar System (`/calendar`)**: Month-by-month historical inspection of daily check-ins and completion records.
- **Isolated Admin Portal (`/admin/login` & `/admin`)**: Elevated admin system to manage user accounts, suspensions, password resets, system audit logs, announcements, and feature flags.
- **Future Expansion Plugin Architecture**: `ModuleRegistry` interface enabling plug-in modules (Pomodoro Timer, Expense Tracker, AI Habit Coach, Mood Journal) without touching core app code.

---

## 🔐 Credentials & Quick Access

| User Role | Email | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **Demo User** | `user@habithub.app` | `Password123!` | `/login` |
| **Admin User** | `admin@habithub.app` | `AdminPassword123!` | `/admin/login` |

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15+ (App Router, Server Actions, Route Handlers)
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons
- **Database & ORM**: PostgreSQL / SQLite fallback with Prisma ORM
- **Authentication**: NextAuth / Custom JWT Session Management with bcryptjs hashing
- **Validation**: Zod schema validation
- **Testing**: Vitest test runner

---

## 🚀 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/habithub/habithub.git
   cd habithub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. **Initialize & Seed Database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Run Tests**:
   ```bash
   npm test
   ```

6. **Start Dev Server**:
   ```bash
   npm run dev
   ```

7. **Production Build**:
   ```bash
   npm run build
   ```

---

## 📄 License
MIT License. Built with ❤️ by Antigravity Senior Software Engineering Team.
