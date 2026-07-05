import type { ReactNode } from "react";

interface ModalProps {
  onClose: () => void;
  maxWidth?: string;
  children: ReactNode;
}

export function Modal({ onClose, maxWidth = "460px", children }: ModalProps) {
  return (
    <div
      className="animate-fade-in fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full rounded-2xl border border-gold/20 bg-background-panel p-7 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  );
}
