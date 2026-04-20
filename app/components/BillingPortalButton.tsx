"use client";

import { useState } from "react";

export default function BillingPortalButton({ variant = "full" }: { variant?: "full" | "compact" }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const { url, error } = await res.json();
      if (error || !url) { alert("Грешка: " + (error ?? "Няма billing акаунт")); setLoading(false); return; }
      window.location.href = url;
    } catch {
      alert("Нещо се обърка. Опитай пак.");
      setLoading(false);
    }
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-amber-400 text-black font-bold px-4 py-2 rounded-lg text-xs hover:bg-amber-300 transition-colors whitespace-nowrap disabled:opacity-60"
      >
        {loading ? "Зареждане..." : "Обнови карта"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all group text-left disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div>
        <p className="font-bold text-sm">{loading ? "Зареждане..." : "Управление на абонамента"}</p>
        <p className="text-white/35 text-xs mt-0.5">Смяна на карта, фактури, отказване</p>
      </div>
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/15 border-t-white/60 rounded-full animate-spin flex-shrink-0" />
      ) : (
        <svg className="w-4 h-4 text-white/25 group-hover:text-white/60 transition-colors flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </button>
  );
}
