"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Sprout, 
  CheckSquare, 
  BarChart3, 
  Calendar as CalendarIcon, 
  PieChart, 
  User, 
  ShieldAlert, 
  LogOut, 
  Sun, 
  Moon, 
  Layers 
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("habithub_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("habithub_user");
    setUser(null);
    router.push("/login");
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: CheckSquare },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/analytics", label: "Analytics", icon: PieChart },
    { href: "/calendar", label: "Calendar", icon: CalendarIcon },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-nature-950/80 border-b border-nature-200 dark:border-nature-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 rounded-xl nature-gradient flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-forest to-leaf bg-clip-text text-transparent dark:from-mint dark:to-nature-200">
            HabitHub
          </span>
        </Link>

        {/* Navigation Links */}
        {user && (
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-nature-100 text-nature-800 dark:bg-nature-800 dark:text-nature-100"
                      : "text-nature-700 hover:bg-nature-50 dark:text-nature-300 dark:hover:bg-nature-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-nature-700 dark:text-nature-300 hover:bg-nature-100 dark:hover:bg-nature-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-300 dark:border-amber-700"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <span className="hidden sm:block text-sm font-medium text-nature-800 dark:text-nature-200">
                {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-nature-700 dark:text-nature-200 hover:bg-nature-100 dark:hover:bg-nature-800 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white nature-gradient hover:opacity-95 shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
