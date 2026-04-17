"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

const nav = [
  { href: "/admin", label: "Табло", icon: "📊" },
  { href: "/admin/course", label: "Съдържание", icon: "🎬" },
  { href: "/admin/users", label: "Потребители", icon: "👥" },
  { href: "/admin/modules", label: "Модули", icon: "📚" },
  { href: "/admin/arena", label: "Арена", icon: "🏆" },
  { href: "/admin/notifications", label: "Известия", icon: "🔔" },
  { href: "/admin/revenue", label: "Приходи", icon: "💰" },
  { href: "/admin/moderation", label: "Модерация", icon: "🛡" },
  { href: "/admin/settings", label: "Настройки", icon: "⚙" },
  { href: "/admin/logs", label: "Логове", icon: "📋" },
];

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/6">
        <Link href="/admin" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="w-7 h-7 rounded-lg bg-[#c8ff00] flex items-center justify-center">
            <span className="text-black text-xs font-black">V</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white/90">Vekto Admin</p>
            <p className="text-[10px] text-white/30 -mt-0.5">Управление</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                active
                  ? "bg-[#c8ff00]/10 text-[#c8ff00] font-semibold"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/6 flex items-center gap-3">
        <UserButton />
        <div className="flex-1 min-w-0">
          <Link
            href="/dashboard"
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            ← Към платформата
          </Link>
        </div>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = nav.find(
    (item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
  );

  return (
    <div className="flex min-h-screen bg-[#060606]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 max-w-[85vw] bg-[#0a0a0a] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="w-56 border-r border-white/6 bg-[#0a0a0a] hidden md:flex flex-col">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/6 bg-[#0a0a0a] sticky top-0 z-40">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="w-6 h-6 rounded-md bg-[#c8ff00] flex items-center justify-center">
            <span className="text-black text-[10px] font-black">V</span>
          </div>
          <span className="text-sm font-semibold text-white/70">{currentPage?.label ?? "Admin"}</span>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
