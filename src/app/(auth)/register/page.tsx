"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sprout, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto login immediately without email verification required
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();
      if (loginRes.ok) {
        localStorage.setItem("habithub_user", JSON.stringify(loginData.user));
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl nature-gradient mx-auto flex items-center justify-center text-white shadow-lg">
          <Sprout className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-nature-950 dark:text-white">Create Account</h1>
        <p className="text-sm text-nature-600 dark:text-nature-400">
          Start tracking habits immediately - No email verification required
        </p>
      </div>

      <div className="nature-card p-8 shadow-xl space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-nature-800 dark:text-nature-200 uppercase">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-nature-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-nature-200 dark:border-nature-800 bg-white/50 dark:bg-nature-900/50 focus:outline-none focus:ring-2 focus:ring-leaf text-sm"
                placeholder="Alex Morgan"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-nature-800 dark:text-nature-200 uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-nature-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-nature-200 dark:border-nature-800 bg-white/50 dark:bg-nature-900/50 focus:outline-none focus:ring-2 focus:ring-leaf text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-nature-800 dark:text-nature-200 uppercase">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-nature-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-nature-200 dark:border-nature-800 bg-white/50 dark:bg-nature-900/50 focus:outline-none focus:ring-2 focus:ring-leaf text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl nature-gradient text-white font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? <span>Creating Account...</span> : <><span>Create & Enter App</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="pt-4 border-t border-nature-100 dark:border-nature-800 text-center text-xs text-nature-600 dark:text-nature-400">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-leaf hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
