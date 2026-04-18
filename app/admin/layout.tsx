"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type NavItem = { href: string; label: string; icon: string };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "Общ преглед",
    items: [
      { href: "/admin", label: "Табло", icon: "📊" },
      { href: "/admin/revenue", label: "Приходи", icon: "💰" },
    ],
  },
  {
    label: "Съдържание",
    items: [
      { href: "/admin/modules", label: "Модули", icon: "📚" },
      { href: "/admin/course", label: "Уроци", icon: "🎬" },
      { href: "/admin/arena", label: "Арена", icon: "🏆" },
    ],
  },
  {
    label: "Общност",
    items: [
      { href: "/admin/users", label: "Потребители", icon: "👥" },
      { href: "/admin/jobs", label: "Кандидатури", icon: "💼" },
      { href: "/admin/notifications", label: "Известия", icon: "🔔" },
      { href: "/admin/moderation", label: "Модерация", icon: "🛡" },
    ],
  },
  {
    label: "Система",
    items: [
      { href: "/admin/settings", label: "Настройки", icon: "⚙" },
      { href: "/admin/logs", label: "Логове", icon: "📋" },
      { href: "/admin/errors", label: "Грешки", icon: "🚨" },
    ],
  },
];

const flatNav: NavItem[] = groups.flatMap((g) => g.items);

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href));
}

function SidebarContent({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* Brand */}
      <div className={`${collapsed ? "px-3" : "px-5"} py-5 border-b border-white/6 flex items-center ${collapsed ? "justify-center" : "justify-start"}`}>
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c8ff00] to-[#a8e600] flex items-center justify-center shadow-lg shadow-[#c8ff00]/10 flex-shrink-0">
            <span className="text-black text-sm font-black">V</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-black text-white/95 tracking-tight leading-none">Vekto Admin</p>
              <p className="text-[10px] text-white/30 mt-1 tracking-wider uppercase">Console</p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {groups.map((group) => (
          <div key={group.label} className={collapsed ? "mb-4" : "mb-5"}>
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25 px-2.5 mb-1.5">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={`relative flex items-center gap-3 ${collapsed ? "justify-center px-0 py-2.5" : "px-2.5 py-2"} rounded-lg text-sm transition-all mb-0.5 ${
                    active
                      ? "bg-[#c8ff00]/[0.08] text-[#c8ff00] font-semibold"
                      : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
                  }`}
                >
                  {active && !collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-[#c8ff00]" />
                  )}
                  <span className={`text-base leading-none ${active ? "opacity-100" : "opacity-60"}`}>{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`border-t border-white/6 ${collapsed ? "px-2 py-3" : "px-3 py-3"} flex items-center gap-2.5 bg-black/20`}>
        <div className="flex-shrink-0">
          <UserButton />
        </div>
        {!collapsed && (
          <Link
            href="/dashboard"
            className="text-[11px] text-white/35 hover:text-white/80 transition-colors truncate flex items-center gap-1"
          >
            <span>←</span>
            <span>Към платформата</span>
          </Link>
        )}
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Persist collapse state
  useEffect(() => {
    const stored = localStorage.getItem("admin:sidebar-collapsed");
    if (stored === "1") setCollapsed(true);
  }, []);
  useEffect(() => {
    localStorage.setItem("admin:sidebar-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const currentPage = flatNav.find((item) => isActive(pathname, item.href));

  return (
    <div className="flex min-h-screen bg-[#060606] text-white">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 max-w-[85vw] bg-[#0a0a0a] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent pathname={pathname} collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`${collapsed ? "w-[68px]" : "w-60"} border-r border-white/6 bg-[#0a0a0a] hidden md:flex flex-col sticky top-0 h-screen transition-[width] duration-200`}
      >
        <SidebarContent pathname={pathname} collapsed={collapsed} />
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/6 bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-40">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Отвори меню"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="w-6 h-6 rounded-md bg-[#c8ff00] flex items-center justify-center">
            <span className="text-black text-[10px] font-black">V</span>
          </div>
          <span className="text-sm font-semibold text-white/80">{currentPage?.label ?? "Admin"}</span>
        </div>

        {/* Desktop collapse button (fixed to viewport edge of sidebar) */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Разшири меню" : "Свий меню"}
          className={`hidden md:flex fixed top-5 ${collapsed ? "left-[56px]" : "left-[228px]"} z-30 w-6 h-6 items-center justify-center rounded-full bg-[#111] border border-white/10 text-white/40 hover:text-white hover:border-white/25 transition-all shadow-lg shadow-black/40`}
        >
          <svg
            className={`w-3 h-3 transition-transform ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="p-5 md:p-8 max-w-[1600px] w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
