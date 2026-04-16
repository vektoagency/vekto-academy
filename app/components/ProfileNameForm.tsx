"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function ProfileNameForm() {
  const { user } = useUser();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function startEdit() {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setEditing(true);
    setSaved(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({ firstName, lastName });
      setSaved(true);
      setTimeout(() => { setSaved(false); setEditing(false); }, 1200);
    } catch {
      // silent
    }
    setSaving(false);
  }

  if (!editing) {
    return (
      <button
        onClick={startEdit}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/8 text-xs text-white/50 hover:text-white/80 hover:bg-white/8 transition-all mb-4"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Промени име
      </button>
    );
  }

  return (
    <div className="border border-white/6 rounded-xl p-4 mb-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Име</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#c8ff00]/30"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Фамилия</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#c8ff00]/30"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 rounded-lg bg-[#c8ff00] text-black text-xs font-bold hover:bg-[#d4ff33] transition-colors disabled:opacity-40"
        >
          {saving ? "..." : saved ? "Готово ✓" : "Запази"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-4 py-1.5 rounded-lg bg-white/5 text-white/40 text-xs hover:text-white/70 transition-colors"
        >
          Откажи
        </button>
      </div>
    </div>
  );
}
