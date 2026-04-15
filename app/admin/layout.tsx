"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const nav = [
  { href: "/admin", label: "Табло", icon: "📊" },
  { href: "/admin/users", label: "Потребители", icon: "👥" },
  { href: "/admin/notifications", label: "Известия", icon: "🔔" },
  { href: "/admin/revenue", label: "Приходи", icon: "💰" },
  { href: "/admin/modules", label: "Модули", icon: "📚" },
  { href: "/admin/arena", label: "Арена", icon: "🏆" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#060606]">
      {/* Sidebar */}
      <aside className="w-56 border-r border-white/6 bg-[#0a0a0a] flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/6">
          <Link href="/admin" className="flex items-center gap-2">
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
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
