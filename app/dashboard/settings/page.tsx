"use client";

import { UserProfile } from "@clerk/nextjs";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black">Настройки на профила</h1>
            <p className="text-white/40 text-sm mt-1">Име, email, парола, снимка и сигурност</p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1.5"
          >
            ← Към таблото
          </Link>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/8 bg-[#111]">
          <UserProfile
            appearance={{
              variables: {
                colorPrimary: "#c8ff00",
                colorBackground: "#111111",
                colorText: "#ffffff",
                colorTextSecondary: "rgba(255,255,255,0.5)",
                colorInputBackground: "rgba(255,255,255,0.04)",
                colorInputText: "#ffffff",
                borderRadius: "0.75rem",
                fontFamily: "inherit",
              },
              elements: {
                rootBox: { width: "100%" },
                card: { background: "transparent", boxShadow: "none", border: "none" },
                navbar: { background: "transparent", borderRight: "1px solid rgba(255,255,255,0.06)" },
                pageScrollBox: { padding: "1.5rem" },
                headerTitle: { color: "#ffffff" },
                headerSubtitle: { color: "rgba(255,255,255,0.4)" },
                formButtonPrimary: {
                  background: "#c8ff00",
                  color: "#000000",
                  "&:hover": { background: "#d4ff33" },
                },
                profileSectionPrimaryButton: { color: "#c8ff00" },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
