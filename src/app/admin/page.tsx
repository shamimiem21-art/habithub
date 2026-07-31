"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  Users, 
  Activity, 
  Bell, 
  Terminal, 
  Ban, 
  CheckCircle, 
  KeyRound, 
  Trash2, 
  Plus, 
  Search, 
  BarChart3, 
  Lock 
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [systemData, setSystemData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"users" | "logs" | "announcements" | "flags">("users");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Announcement modal
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [showAnnoModal, setShowAnnoModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("habithub_user");
    if (!stored) {
      router.push("/admin/login");
      return;
    }
    const u = JSON.parse(stored);
    if (u.role !== "ADMIN") {
      router.push("/admin/login");
      return;
    }
    setAdmin(u);
    fetchData(u.id);
  }, []);

  const fetchData = async (adminId: string) => {
    setLoading(true);
    try {
      const [uRes, sRes] = await Promise.all([
        fetch(`/api/admin/users?adminId=${adminId}`),
        fetch(`/api/admin/system?adminId=${adminId}`),
      ]);
      const uData = await uRes.json();
      const sData = await sRes.json();
      if (uRes.ok) setUsers(uData.users || []);
      if (sRes.ok) setSystemData(sData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUserAction = async (targetUserId: string, action: string, newPassword?: string) => {
    if (!admin) return;
    if (action === "DELETE" && !confirm("Permanently delete user and all associated habits?")) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: admin.id,
          targetUserId,
          action,
          newPassword,
        }),
      });
      if (res.ok) {
        fetchData(admin.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;

    try {
      await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: admin.id,
          title: announcementTitle,
          content: announcementContent,
        }),
      });
      setShowAnnoModal(false);
      setAnnouncementTitle("");
      setAnnouncementContent("");
      fetchData(admin.id);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200 dark:border-amber-900/50 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>HabitHub System Administration Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-nature-950 dark:text-white">Admin Control Center</h1>
        </div>

        <div className="flex items-center space-x-2">
          {["users", "logs", "announcements", "flags"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-nature-100 dark:bg-nature-800 text-nature-700 dark:text-nature-300 hover:bg-nature-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Telemetry Metrics */}
      {systemData?.stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="nature-card p-4 space-y-1 border-amber-200 dark:border-amber-900/50">
            <div className="text-xs text-nature-500 font-bold uppercase">Total Registered Users</div>
            <div className="text-2xl font-extrabold text-nature-950 dark:text-white">{systemData.stats.totalUsers}</div>
          </div>
          <div className="nature-card p-4 space-y-1 border-emerald-200 dark:border-emerald-900/50">
            <div className="text-xs text-emerald-600 font-bold uppercase">Active Accounts</div>
            <div className="text-2xl font-extrabold text-emerald-600">{systemData.stats.activeUsers}</div>
          </div>
          <div className="nature-card p-4 space-y-1 border-red-200 dark:border-red-900/50">
            <div className="text-xs text-red-500 font-bold uppercase">Suspended Accounts</div>
            <div className="text-2xl font-extrabold text-red-500">{systemData.stats.suspendedUsers}</div>
          </div>
          <div className="nature-card p-4 space-y-1 border-leaf/40">
            <div className="text-xs text-nature-500 font-bold uppercase">Active Habit Tasks</div>
            <div className="text-2xl font-extrabold text-leaf">{systemData.stats.totalHabits}</div>
          </div>
          <div className="nature-card p-4 space-y-1 border-purple-200 dark:border-purple-900/50">
            <div className="text-xs text-purple-600 font-bold uppercase">Platform Check-ins</div>
            <div className="text-2xl font-extrabold text-purple-600">{systemData.stats.totalCheckins}</div>
          </div>
        </div>
      )}

      {/* Tab 1: User Governance */}
      {activeTab === "users" && (
        <div className="nature-card p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-nature-950 dark:text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>User Governance & Permissions</span>
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-nature-400" />
              <input
                type="text"
                placeholder="Search user email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-nature-200 dark:border-nature-800 bg-white/80 dark:bg-nature-900/80 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-nature-200 dark:border-nature-800 text-xs font-bold text-nature-600 dark:text-nature-400 uppercase">
                  <th className="py-3 px-2">User Details</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-center">Habits Count</th>
                  <th className="py-3 text-right pr-2">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nature-100 dark:divide-nature-900 text-sm">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-nature-50/50 dark:hover:bg-nature-900/30">
                    <td className="py-3 px-2">
                      <div className="font-bold text-nature-900 dark:text-nature-100">{u.name}</div>
                      <div className="text-xs text-nature-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${u.role === "ADMIN" ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200" : "bg-nature-100 text-nature-800 dark:bg-nature-800 dark:text-nature-200"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${u.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-center font-semibold text-nature-700 dark:text-nature-300">
                      {u._count?.habits || 0}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex items-center justify-end space-x-2">
                        {u.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleAdminUserAction(u.id, "SUSPEND")}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 flex items-center space-x-1"
                            title="Suspend user"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAdminUserAction(u.id, "REACTIVATE")}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center space-x-1"
                            title="Reactivate user"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Reactivate</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const newPass = prompt("Enter new password for " + u.name + ":");
                            if (newPass) handleAdminUserAction(u.id, "RESET_PASSWORD", newPass);
                          }}
                          className="px-2 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300 flex items-center space-x-1"
                          title="Reset password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleAdminUserAction(u.id, "DELETE")}
                          className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Delete account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: System Logs */}
      {activeTab === "logs" && (
        <div className="nature-card p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-nature-950 dark:text-white flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-amber-600" />
            <span>Audit & System Security Telemetry Logs</span>
          </h2>

          <div className="bg-nature-950 text-emerald-400 font-mono p-4 rounded-xl text-xs space-y-2 max-h-96 overflow-y-auto">
            {(systemData?.logs || []).map((log: any) => (
              <div key={log.id} className="flex items-start space-x-2 border-b border-nature-900 pb-1.5">
                <span className="text-nature-500">[{new Date(log.createdAt).toISOString()}]</span>
                <span className={`font-bold ${log.level === "SECURITY" ? "text-amber-400" : log.level === "WARN" ? "text-red-400" : "text-emerald-400"}`}>
                  [{log.level}]
                </span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Announcements */}
      {activeTab === "announcements" && (
        <div className="nature-card p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-nature-950 dark:text-white flex items-center space-x-2">
              <Bell className="w-5 h-5 text-amber-600" />
              <span>Platform Announcements Manager</span>
            </h2>
            <button
              onClick={() => setShowAnnoModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>New Announcement</span>
            </button>
          </div>

          <div className="space-y-3">
            {(systemData?.announcements || []).map((a: any) => (
              <div key={a.id} className="p-4 rounded-xl bg-nature-50/70 dark:bg-nature-900/40 border border-nature-200 dark:border-nature-800 space-y-1">
                <div className="flex items-center justify-between text-sm font-bold text-nature-900 dark:text-nature-100">
                  <span>{a.title}</span>
                  <span className="text-xs text-nature-500 font-normal">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-nature-600 dark:text-nature-400">{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="nature-card p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-nature-950 dark:text-white">Publish Broadcast Announcement</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Title"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-nature-200 dark:border-nature-800 bg-white/80 dark:bg-nature-900/80"
              />
              <textarea
                required
                placeholder="Announcement message content..."
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-nature-200 dark:border-nature-800 bg-white/80 dark:bg-nature-900/80"
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAnnoModal(false)} className="px-4 py-2 text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold">Publish Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
