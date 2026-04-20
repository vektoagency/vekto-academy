"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageHeader from "../PageHeader";

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  createdAt: number;
  role: string;
  plan: string | null;
  status: string | null;
  completedLessons: number;
};

const planBadge: Record<string, string> = {
  monthly: "bg-white/10 text-white/60",
  yearly: "bg-blue-500/20 text-blue-400",
  lifetime: "bg-[#c8ff00]/15 text-[#c8ff00]",
};

const statusBadge: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  past_due: "bg-amber-500/20 text-amber-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
        </div>
      }
    >
      <AdminUsers />
    </Suspense>
  );
}

function AdminUsers() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get("status") ?? "";
  const roleFilter = searchParams.get("role") ?? "";
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setFilter(key: "status" | "role", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/admin/users${params.toString() ? `?${params}` : ""}`);
  }

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(({ users }) => setUsers(users ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.email.toLowerCase().includes(q) ||
      (u.firstName?.toLowerCase() ?? "").includes(q) ||
      (u.lastName?.toLowerCase() ?? "").includes(q);
    const matchesStatus = !statusFilter || u.status === statusFilter;
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  async function toggleRole(user: User) {
    const newRole = user.role === "admin" ? "" : "admin";
    setSaving(true);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole || "user" } : u))
    );
    setSaving(false);
    setEditingId(null);
  }

  async function updatePlan(userId: string, plan: string) {
    setSaving(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, status: "active" }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, plan, status: "active" } : u))
    );
    setSaving(false);
    setEditingId(null);
  }

  async function cancelUser(userId: string) {
    setSaving(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "cancelled" } : u))
    );
    setSaving(false);
    setEditingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Потребители"
        subtitle={`${filtered.length}${filtered.length !== users.length ? ` от ${users.length}` : ""} ${filtered.length === 1 ? "регистриран" : "регистрирани"}`}
        icon="👥"
        actions={
          <input
            type="text"
            placeholder="Търси по имейл или име..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white/80 placeholder-white/20 w-full sm:w-72 focus:outline-none focus:border-[#c8ff00]/30 transition-colors"
          />
        }
      />

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={!statusFilter && !roleFilter} onClick={() => { setFilter("status", ""); setFilter("role", ""); }}>
          Всички
        </FilterChip>
        <FilterChip active={statusFilter === "active"} onClick={() => setFilter("status", statusFilter === "active" ? "" : "active")}>
          Активни
        </FilterChip>
        <FilterChip active={statusFilter === "past_due"} onClick={() => setFilter("status", statusFilter === "past_due" ? "" : "past_due")}>
          Просрочени
        </FilterChip>
        <FilterChip active={statusFilter === "cancelled"} onClick={() => setFilter("status", statusFilter === "cancelled" ? "" : "cancelled")}>
          Отписани
        </FilterChip>
        <FilterChip active={roleFilter === "admin"} onClick={() => setFilter("role", roleFilter === "admin" ? "" : "admin")}>
          Админи
        </FilterChip>
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/6">
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Потребител</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">План</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Статус</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Прогрес</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Роля</th>
              <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-white/4 hover:bg-white/[0.02] transition-colors">
                {/* User */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img src={u.imageUrl} alt="" className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-white/80 font-medium">
                        {u.firstName ?? ""} {u.lastName ?? ""}
                      </p>
                      <p className="text-[11px] text-white/30">{u.email}</p>
                    </div>
                  </div>
                </td>

                {/* Plan */}
                <td className="px-5 py-3">
                  {u.plan ? (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${planBadge[u.plan] ?? "bg-white/10 text-white/40"}`}>
                      {u.plan}
                    </span>
                  ) : (
                    <span className="text-white/15 text-xs">—</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-5 py-3">
                  {u.status ? (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusBadge[u.status] ?? "bg-white/10 text-white/40"}`}>
                      {u.status}
                    </span>
                  ) : (
                    <span className="text-white/15 text-xs">—</span>
                  )}
                </td>

                {/* Progress */}
                <td className="px-5 py-3">
                  <span className="text-white/50 text-xs">{u.completedLessons} урока</span>
                </td>

                {/* Role */}
                <td className="px-5 py-3">
                  {u.role === "admin" ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#c8ff00]/15 text-[#c8ff00]">admin</span>
                  ) : (
                    <span className="text-white/25 text-xs">user</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-5 py-3 text-right">
                  {editingId === u.id ? (
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={saving}
                        className="px-2 py-1 text-[11px] rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                      >
                        {u.role === "admin" ? "Премахни admin" : "Направи admin"}
                      </button>
                      {!u.plan && (
                        <button
                          onClick={() => updatePlan(u.id, "monthly")}
                          disabled={saving}
                          className="px-2 py-1 text-[11px] rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                        >
                          Дай достъп
                        </button>
                      )}
                      {u.status === "active" && (
                        <button
                          onClick={() => cancelUser(u.id)}
                          disabled={saving}
                          className="px-2 py-1 text-[11px] rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          Отпиши
                        </button>
                      )}
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 text-[11px] rounded-lg bg-white/5 text-white/30 hover:text-white/60 transition-colors"
                      >
                        Затвори
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingId(u.id)}
                      className="px-3 py-1 text-[11px] rounded-lg bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                    >
                      Управление
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-white/20 text-sm">
                  Няма намерени потребители
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
        active
          ? "bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/25"
          : "bg-white/4 text-white/50 border-white/8 hover:bg-white/8 hover:text-white/80"
      }`}
    >
      {children}
    </button>
  );
}
