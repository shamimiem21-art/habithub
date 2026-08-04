import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "HabitHub - Daily Habit Tracker & Consistency Engine",
  description: "Track habits, master streaks, generate weekly & monthly reports, and optimize your productivity with HabitHub.",
  other: {
    "build-version": "1.0.7",
    "deployment-time": "2026-08-04T19:05:00Z",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col antialiased bg-nature-50 dark:bg-nature-950 text-nature-900 dark:text-nature-50 selection:bg-leaf selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-nature-200 dark:border-nature-800 py-6 text-center text-xs text-nature-600 dark:text-nature-400">
          <p>© {new Date().getFullYear()} HabitHub SaaS Platform. Built with Nature-Inspired Design.</p>
        </footer>
      </body>
    </html>
  );
}
