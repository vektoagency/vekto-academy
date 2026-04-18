import React from "react";

export default function PageHeader({
  title,
  subtitle,
  actions,
  icon,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6 pb-5 border-b border-white/6">
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/8 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-white/95 tracking-tight leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-white/40 mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
