"use client";

import { use, useState, useEffect } from "react";
import { moduleRegistry, HabitHubModule } from "@/lib/modules";
import { Timer, Smile, DollarSign, Sparkles, BookOpen, Play, Pause, RotateCcw } from "lucide-react";

export default function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mod, setMod] = useState<HabitHubModule | null>(null);

  // Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const found = moduleRegistry.getModule(id);
    if (found) setMod(found);
  }, [id]);

  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  if (!mod) {
    return (
      <div className="nature-card p-12 text-center text-nature-600 dark:text-nature-400">
        Module "{id}" not found in registry.
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl nature-gradient flex items-center justify-center text-white shadow-lg">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-leaf">Plugin Module v{mod.version}</span>
          <h1 className="text-3xl font-extrabold text-nature-950 dark:text-white">{mod.name}</h1>
        </div>
      </div>

      <div className="nature-card p-8 shadow-xl space-y-6">
        <p className="text-sm text-nature-600 dark:text-nature-400 leading-relaxed">
          {mod.description}
        </p>

        {/* Interactive Pomodoro Timer Module View */}
        {mod.id === "pomodoro" && (
          <div className="text-center space-y-6 py-6">
            <div className="text-6xl font-black font-mono tracking-wider text-nature-950 dark:text-white">
              {formatTime(timeLeft)}
            </div>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-6 py-3 rounded-xl nature-gradient text-white font-bold shadow-md hover:opacity-95 flex items-center space-x-2"
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isRunning ? "Pause Focus" : "Start Focus"}</span>
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setTimeLeft(25 * 60);
                }}
                className="p-3 rounded-xl bg-nature-100 dark:bg-nature-800 text-nature-700 dark:text-nature-300"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* AI Habit Coach View */}
        {mod.id === "ai_coach" && (
          <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-nature-900/60 dark:to-nature-950 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <h3 className="font-bold text-nature-900 dark:text-nature-100 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-leaf" />
              <span>AI Routine Recommendation</span>
            </h3>
            <p className="text-sm text-nature-700 dark:text-nature-300">
              "Based on your recent 7-day streak, scheduling your exercise habit right after your morning meditation will increase completion rate by 24%."
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
