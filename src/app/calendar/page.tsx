"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export default function CalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [habits, setHabits] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("habithub_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);
    fetchHabits(u.id);
  }, []);

  const fetchHabits = async (userId: string) => {
    try {
      const res = await fetch(`/api/habits?userId=${userId}`);
      const data = await res.json();
      if (res.ok) setHabits(data.habits || []);
    } catch (e) {
      console.error(e);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-nature-950 dark:text-white flex items-center space-x-2">
            <CalendarIcon className="w-8 h-8 text-leaf" />
            <span>Historical Calendar Logs</span>
          </h1>
          <p className="text-sm text-nature-600 dark:text-nature-400">
            Inspect past check-ins, navigate historical dates, and review streak history
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-2 bg-white/80 dark:bg-nature-900/80 p-1.5 rounded-xl border border-nature-200 dark:border-nature-800 shadow-sm">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg hover:bg-nature-100 dark:hover:bg-nature-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold px-3 min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg hover:bg-nature-100 dark:hover:bg-nature-800"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="nature-card p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase text-nature-500 pb-2 border-b border-nature-200 dark:border-nature-800">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            let completedCount = 0;
            habits.forEach((h) => {
              const log = (h.logs || []).find((l: any) => l.date === dateStr);
              if (log?.completed) completedCount++;
            });

            return (
              <div
                key={dateStr}
                className={`min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                  isToday(day)
                    ? "border-leaf bg-leaf/10 font-bold"
                    : "border-nature-200 dark:border-nature-800/60 bg-white/50 dark:bg-nature-900/30"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={isToday(day) ? "text-leaf font-extrabold" : "text-nature-700 dark:text-nature-300"}>
                    {format(day, "d")}
                  </span>
                  {completedCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-leaf animate-ping" />
                  )}
                </div>

                {completedCount > 0 ? (
                  <div className="mt-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-[10px] font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                    <span>Done</span>
                    <span>{completedCount}</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-nature-400 font-light">No logs</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
