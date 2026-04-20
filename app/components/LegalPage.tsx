import Link from "next/link";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#080808] text-white px-5 sm:px-8 py-14 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-[#c8ff00] transition-colors mb-8"
        >
          <span aria-hidden>←</span> Към началната страница
        </Link>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] mb-3">
          {title}
        </h1>
        <p className="text-xs text-white/40 mb-10 uppercase tracking-widest">
          В сила от {updated}
        </p>

        <div className="legal-content text-white/75 text-[15px] leading-[1.75] space-y-6">
          {children}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-xs text-white/40 space-y-2">
          <p>&quot;Менс Кеър България&quot; ООД · ЕИК 208013578</p>
          <p>бул. &quot;Тракия&quot; № 12, ет. 2, ап. 8, гр. Варна 9000, България</p>
          <p>
            Контакт:{" "}
            <a href="mailto:support@vektoacademy.com" className="text-[#c8ff00] hover:underline">
              support@vektoacademy.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
