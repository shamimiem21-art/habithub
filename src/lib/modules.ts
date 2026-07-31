export interface HabitHubModule {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string;
  route: string;
  category: "productivity" | "wellness" | "finance" | "planning" | "ai";
  enabledByDefault: boolean;
  navItem?: {
    label: string;
    href: string;
    icon: string;
  };
}

class ModuleRegistry {
  private modules: Map<string, HabitHubModule> = new Map();

  constructor() {
    this.registerBuiltinModules();
  }

  private registerBuiltinModules() {
    const builtin: HabitHubModule[] = [
      {
        id: "pomodoro",
        name: "Pomodoro Timer",
        description: "Focus timer with customizable intervals and breakdown statistics.",
        version: "1.0.0",
        author: "HabitHub Core",
        icon: "Timer",
        route: "/modules/pomodoro",
        category: "productivity",
        enabledByDefault: true,
        navItem: { label: "Focus Timer", href: "/modules/pomodoro", icon: "Timer" },
      },
      {
        id: "mood_tracker",
        name: "Mood & Emotion Tracker",
        description: "Log daily moods and analyze habit correlations with emotional wellbeing.",
        version: "1.0.0",
        author: "HabitHub Core",
        icon: "Smile",
        route: "/modules/mood",
        category: "wellness",
        enabledByDefault: true,
        navItem: { label: "Mood Journal", href: "/modules/mood", icon: "Smile" },
      },
      {
        id: "expense_tracker",
        name: "Expense & Budget Tracker",
        description: "Link daily financial habits with budget goals and savings milestones.",
        version: "1.0.0",
        author: "HabitHub Core",
        icon: "DollarSign",
        route: "/modules/expenses",
        category: "finance",
        enabledByDefault: false,
        navItem: { label: "Expenses", href: "/modules/expenses", icon: "DollarSign" },
      },
      {
        id: "ai_coach",
        name: "AI Habit Coach",
        description: "Personalized habit advice, routine optimization, and motivational feedback.",
        version: "1.0.0",
        author: "HabitHub AI",
        icon: "Sparkles",
        route: "/modules/ai-coach",
        category: "ai",
        enabledByDefault: true,
        navItem: { label: "AI Coach", href: "/modules/ai-coach", icon: "Sparkles" },
      },
      {
        id: "journal",
        name: "Daily Journal & Reflections",
        description: "Markdown journal entries connected to daily task completions.",
        version: "1.0.0",
        author: "HabitHub Core",
        icon: "BookOpen",
        route: "/modules/journal",
        category: "wellness",
        enabledByDefault: true,
        navItem: { label: "Journal", href: "/modules/journal", icon: "BookOpen" },
      },
    ];

    builtin.forEach((mod) => this.modules.set(mod.id, mod));
  }

  public register(mod: HabitHubModule): void {
    this.modules.set(mod.id, mod);
  }

  public getModule(id: string): HabitHubModule | undefined {
    return this.modules.get(id);
  }

  public getAllModules(): HabitHubModule[] {
    return Array.from(this.modules.values());
  }
}

export const moduleRegistry = new ModuleRegistry();
