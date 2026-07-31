"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@habithub.app");
  const [password, setPassword] = useState("AdminPassword123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Admin authentication failed");
      }

      localStorage.setItem("habithub_user", JSON.stringify(data.user));
      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 mx-auto flex items-center justify-center text-white shadow-xl">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-nature-950 dark:text-white">Admin Portal</h1>
        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
          Elevated Administrative Security Gateway
        </p>
      </div>

      <div className="nature-card p-8 shadow-xl space-y-6 border-amber-200 dark:border-amber-900/50">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 uppercase">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-nature-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white/50 dark:bg-nature-900/50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                placeholder="admin@habithub.app"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 uppercase">
              Admin Key Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-nature-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white/50 dark:bg-nature-900/50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold shadow-lg hover:opacity-95 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? <span>Authenticating Admin...</span> : <><span>Authenticate Admin</span><KeyRound className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="pt-4 border-t border-nature-100 dark:border-nature-800 text-center text-xs text-nature-600 dark:text-nature-400">
          Standard User?{" "}
          <Link href="/login" className="font-bold text-leaf hover:underline">
            Go to User Login
          </Link>
        </div>
      </div>
    </div>
  );
}
