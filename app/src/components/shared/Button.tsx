import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "success" | "secondary" | "danger" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "border-none bg-gradient-to-br from-gold to-gold-dark text-ink font-heading font-bold shadow-[0_2px_12px_rgba(200,155,60,0.3)] hover:shadow-[0_4px_24px_rgba(200,155,60,0.5)] hover:-translate-y-px",
  success:
    "border-none bg-gradient-to-br from-success to-success-dark text-white font-heading font-bold hover:shadow-[0_2px_16px_rgba(78,159,61,0.4)]",
  secondary:
    "border border-gold/30 bg-transparent text-gold font-semibold hover:bg-gold/10",
  danger:
    "border border-danger/30 bg-transparent text-danger font-semibold hover:bg-danger/10",
  ghost:
    "border border-white/8 bg-transparent text-parchment/40 font-semibold hover:border-white/15",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "secondary",
  fullWidth,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        "cursor-pointer rounded-lg px-4 py-2.5 text-sm transition-all duration-150",
        fullWidth ? "flex-1" : "",
        VARIANT_CLASSES[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
