"use client";

import { Fragment, useEffect, useState } from "react";

type Challenge = {
  id: number;
  title: string;
  description: string | null;
  deadline: string | null;
  prize: string | null;
  status: string;
  created_at: string;
  winner_submission_id?: number | null;
};

type Submission = {
  id: number;
  challenge_id: number;
  user_id: string;
  bunny_video_id: string;
  notes: string;
  status: string;
  feedback: string | null;
  created_at: string;
  reviewed_at: string | null;
};

const emptyChallenge = {
  title: "",
  description: "",
  deadline: "",
  prize: "",
  status: "active",
};

const statusBadge: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  ended: "bg-white/10 text-white/40",
  upcoming: "bg-blue-500/20 text-blue-400",
};

export default function AdminArena() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Challenge> | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [bunnyLibraryId, setBunnyLibraryId] = useState("");

  async function loadSubmissions(challengeId: number) {
    setLoadingSubs(true);
    try {
      const res = await fetch(`/api/admin/arena/submissions?challenge_id=${challengeId}`);
      const { data, libraryId } = await res.json();
      setSubmissions(data ?? []);
      if (libraryId) setBunnyLibraryId(libraryId);
    } finally {
      setLoadingSubs(false);
    }
  }

  async function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      setSubmissions([]);
      return;
    }
    setExpandedId(id);
    await loadSubmissions(id);
  }

  async function handleSubmissionAction(submissionId: number, action: "winner" | "reviewed" | "rejected") {
    if (action === "winner" && !confirm("Маркирай като победител? Това ще запише наградата към този участник.")) return;
    const feedback = action !== "winner" ? prompt("Обратна връзка (по избор):") ?? null : null;
    await fetch("/api/admin/arena/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submission_id: submissionId, action, feedback }),
    });
    if (expandedId) await loadSubmissions(expandedId);
    if (action === "winner") await loadChallenges();
  }

  async function loadChallenges() {
    const res = await fetch("/api/admin/arena");
    const { data } = await res.json();
    setChallenges(data ?? []);
  }

  useEffect(() => {
    loadChallenges().finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing?.title?.trim()) return;
    setSaving(true);

    await fetch("/api/admin/arena", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });

    await loadChallenges();
    setEditing(null);
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Сигурен ли си?")) return;
    await fetch("/api/admin/arena", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await loadChallenges();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white/90">Арена</h1>
          <p className="text-sm text-white/30 mt-1">{challenges.length} предизвикателства</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyChallenge })}
          className="px-5 py-2.5 rounded-xl bg-[#c8ff00] text-black text-sm font-bold hover:bg-[#d4ff33] transition-colors"
        >
          + Ново предизвикателство
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <form onSubmit={handleSave} className="bg-[#111] border border-white/6 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white/60">
            {editing.id ? "Редактиране" : "Ново предизвикателство"}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Заглавие</label>
              <input
                type="text"
                value={editing.title ?? ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="AI реклама за 60 сек"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Награда</label>
              <input
                type="text"
                value={editing.prize ?? ""}
                onChange={(e) => setEditing({ ...editing, prize: e.target.value })}
                placeholder="€100 + Feature в портфолио"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Описание</label>
            <textarea
              value={editing.description ?? ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={3}
              placeholder="Подробно описание на предизвикателството..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Краен срок</label>
              <input
                type="date"
                value={editing.deadline ?? ""}
                onChange={(e) => setEditing({ ...editing, deadline: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#c8ff00]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Статус</label>
              <select
                value={editing.status ?? "active"}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#c8ff00]/30"
              >
                <option value="active">Активно</option>
                <option value="upcoming">Предстоящо</option>
                <option value="ended">Приключило</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#c8ff00] text-black text-sm font-bold hover:bg-[#d4ff33] transition-colors disabled:opacity-40"
            >
              {saving ? "Запазване..." : "Запази"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-6 py-2.5 rounded-xl bg-white/5 text-white/40 text-sm hover:text-white/70 transition-colors"
            >
              Откажи
            </button>
          </div>
        </form>
      )}

      {/* Challenges list */}
      <div className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-white/6">
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Заглавие</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Награда</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Краен срок</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Статус</th>
              <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Действия</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map((c) => (
              <Fragment key={c.id}>
                <tr className="border-b border-white/4 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-white/70 font-medium">{c.title}</p>
                    {c.description && (
                      <p className="text-[11px] text-white/25 truncate max-w-xs mt-0.5">{c.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-white/50">{c.prize ?? "—"}</td>
                  <td className="px-5 py-3 text-white/40">
                    {c.deadline ? new Date(c.deadline).toLocaleDateString("bg-BG") : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusBadge[c.status] ?? "bg-white/10 text-white/30"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleExpand(c.id)}
                        className="px-3 py-1 text-[11px] rounded-lg bg-[#c8ff00]/10 text-[#c8ff00]/80 hover:text-[#c8ff00] hover:bg-[#c8ff00]/20 transition-colors"
                      >
                        {expandedId === c.id ? "Скрий" : "Проекти"}
                      </button>
                      <button
                        onClick={() => setEditing(c)}
                        className="px-3 py-1 text-[11px] rounded-lg bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                      >
                        Редактирай
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="px-3 py-1 text-[11px] rounded-lg bg-red-500/10 text-red-400/60 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Изтрий
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === c.id && (
                  <tr className="bg-[#0a0a0a] border-b border-white/6">
                    <td colSpan={5} className="px-5 py-4">
                      {loadingSubs ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-5 h-5 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
                        </div>
                      ) : submissions.length === 0 ? (
                        <p className="text-center py-6 text-white/20 text-xs">Няма проекти за тази задача.</p>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                            {submissions.length} проекта
                          </p>
                          {submissions.map((s) => {
                            const isWinner = c.winner_submission_id === s.id;
                            return (
                              <div
                                key={s.id}
                                className={`bg-[#111] border rounded-xl p-4 ${isWinner ? "border-[#c8ff00]/40" : "border-white/6"}`}
                              >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="md:col-span-1">
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                      <iframe
                                        src={`https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${s.bunny_video_id}`}
                                        loading="lazy"
                                        className="w-full h-full"
                                        allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
                                        allowFullScreen
                                      />
                                    </div>
                                  </div>
                                  <div className="md:col-span-2 flex flex-col">
                                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                      <p className="text-xs font-mono text-white/40 truncate">{s.user_id}</p>
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge[s.status] ?? "bg-white/10 text-white/40"}`}>
                                          {s.status}
                                        </span>
                                        {isWinner && (
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c8ff00]/20 text-[#c8ff00]">🏆 Победител</span>
                                        )}
                                      </div>
                                    </div>
                                    {s.notes && (
                                      <p className="text-xs text-white/55 leading-relaxed mb-2 whitespace-pre-line">{s.notes}</p>
                                    )}
                                    {s.feedback && (
                                      <div className="bg-white/3 border border-white/6 rounded-lg p-2 mb-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Обратна връзка</p>
                                        <p className="text-[11px] text-white/60 whitespace-pre-line">{s.feedback}</p>
                                      </div>
                                    )}
                                    <p className="text-[10px] text-white/25 mb-3">
                                      {new Date(s.created_at).toLocaleString("bg-BG")}
                                    </p>
                                    <div className="flex items-center gap-2 mt-auto flex-wrap">
                                      {!isWinner && (
                                        <button
                                          onClick={() => handleSubmissionAction(s.id, "winner")}
                                          className="px-3 py-1.5 text-[11px] rounded-lg bg-[#c8ff00] text-black font-bold hover:bg-[#d4ff33] transition-colors"
                                        >
                                          🏆 Победител
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleSubmissionAction(s.id, "reviewed")}
                                        className="px-3 py-1.5 text-[11px] rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                      >
                                        Прегледай
                                      </button>
                                      <button
                                        onClick={() => handleSubmissionAction(s.id, "rejected")}
                                        className="px-3 py-1.5 text-[11px] rounded-lg bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                      >
                                        Отхвърли
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {challenges.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-white/20 text-sm">
                  Няма предизвикателства. Създай първото от бутона горе.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
