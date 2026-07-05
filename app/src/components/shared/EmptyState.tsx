import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, subtitle, compact }: EmptyStateProps) {
  if (compact) {
    return (
      <div className="rounded-lg border border-dashed border-white/6 bg-white/1.5 px-4 py-9 text-center font-sans text-sm text-parchment/30">
        <p className="m-0 mb-1">{title}</p>
        {subtitle && <p className="m-0 text-[11px] text-parchment/20">{subtitle}</p>}
      </div>
    );
  }
  return (
    <div className="animate-fade-in px-5 py-20 text-center">
      {icon && <div className="mb-5 text-6xl opacity-30">{icon}</div>}
      <p className="m-0 mb-2 font-heading text-xl font-semibold text-parchment/50">
        {title}
      </p>
      {subtitle && (
        <p className="m-0 font-body text-base leading-relaxed text-parchment/35">
          {subtitle}
        </p>
      )}
    </div>
  );
}
