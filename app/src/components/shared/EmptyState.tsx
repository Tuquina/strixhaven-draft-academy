import type { ReactNode } from "react";
import { GRADIENT_TEXT_GOLD } from "../../lib/gradients";

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
    <div className="animate-fade-in rounded-xl border border-gold/12 bg-arcane-violet/8 px-5 py-20 text-center backdrop-blur-sm">
      {icon && (
        <div className="mb-5 text-6xl opacity-80 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
          {icon}
        </div>
      )}
      <p className={`${GRADIENT_TEXT_GOLD} m-0 mb-2 font-heading-decorative text-2xl font-bold`}>
        {title}
      </p>
      {subtitle && (
        <p className="m-0 font-garamond text-lg leading-relaxed text-parchment/55">
          {subtitle}
        </p>
      )}
    </div>
  );
}
