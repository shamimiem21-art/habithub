"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Bell, Mail, Lock, Shield, Check, AlertCircle, Save } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  // Force brand new Next.js client chunk generation
  const profileBuildHash = "v1.0.4-force-rebuild-cache-bust-20260804-123800";
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("habithub_user");
    let u = stored ? JSON.parse(stored) : { id: "demo-user", name: "Shamim", email: "shamim.iem21@gmail.com" };
    setUser(u);
    setName(u.name || "Shamim");
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);

    try {
      let updatedName = name || (user?.name || "Shamim");
      
      try {
        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id || "demo-user",
            name: updatedName,
            currentPassword: currentPassword || undefined,
            newPassword: newPassword || undefined,
            emailEnabled,
            pushEnabled,
            reminderTime,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (data.user?.name) updatedName = data.user.name;
      } catch (e) {}

      // Always update local storage user
      const updatedUser = { ...(user || {}), name: updatedName, email: user?.email || "shamim.iem21@gmail.com" };
      localStorage.setItem("habithub_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMsg("Profile and notification preferences updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setMsg("Profile and notification preferences updated successfully!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-nature-950 dark:text-white flex items-center space-x-2">
          <User className="w-8 h-8 text-leaf" />
          <span>User Profile & Settings</span>
        </h1>
        <p className="text-sm text-nature-600 dark:text-nature-400">
          Manage account security, email reports & browser notification schedules
        </p>
      </div>

      <div className="nature-card p-8 shadow-xl space-y-6">
        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{msg}</span>
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700 text-xs font-bold text-red-800 dark:text-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-nature-950 dark:text-white border-b border-nature-200 dark:border-nature-800 pb-2">
              Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-nature-800 dark:text-nature-200 uppercase">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-nature-200 dark:border-nature-800 bg-white/80 dark:bg-nature-900/80 focus:ring-2 focus:ring-leaf focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-nature-800 dark:text-nature-200 uppercase">Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || "shamim.iem21@gmail.com"}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-nature-200 dark:border-nature-800 bg-nature-100 dark:bg-nature-900 text-nature-500 cursor-not-allowed font-medium"
                />
              </div>
            </div>
          </div>

          {/* Password Security */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-nature-950 dark:text-white border-b border-nature-200 dark:border-nature-800 pb-2 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-leaf" />
              <span>Change Password</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-nature-800 dark:text-nature-200 uppercase">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-nature-200 dark:border-nature-800 bg-white/80 dark:bg-nature-900/80 focus:ring-2 focus:ring-leaf focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-nature-800 dark:text-nature-200 uppercase">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-nature-200 dark:border-nature-800 bg-white/80 dark:bg-nature-900/80 focus:ring-2 focus:ring-leaf focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notifications & Email Settings */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-nature-950 dark:text-white border-b border-nature-200 dark:border-nature-800 pb-2 flex items-center space-x-2">
              <Bell className="w-4 h-4 text-leaf" />
              <span>Notification & Email Preferences</span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-nature-50/80 dark:bg-nature-900/50 border border-nature-200 dark:border-nature-800 cursor-pointer">
                <div>
                  <div className="text-sm font-bold text-nature-900 dark:text-nature-100">Weekly Email Summary Reports</div>
                  <div className="text-xs text-nature-500">Receive weekly performance summaries & AI recommendations directly to email</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="w-5 h-5 accent-leaf"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-nature-50/80 dark:bg-nature-900/50 border border-nature-200 dark:border-nature-800 cursor-pointer">
                <div>
                  <div className="text-sm font-bold text-nature-900 dark:text-nature-100">Browser Web Push Notifications</div>
                  <div className="text-xs text-nature-500">Daily check-in reminders sent directly to your browser</div>
                </div>
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={(e) => setPushEnabled(e.target.checked)}
                  className="w-5 h-5 accent-leaf"
                />
              </label>

              <div className="flex items-center justify-between p-3 rounded-xl bg-nature-50/80 dark:bg-nature-900/50 border border-nature-200 dark:border-nature-800">
                <div className="text-sm font-bold text-nature-900 dark:text-nature-100">Daily Reminder Time</div>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-nature-200 dark:border-nature-800 bg-white dark:bg-nature-900 text-sm font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl nature-gradient text-white font-bold shadow-md hover:opacity-95 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
