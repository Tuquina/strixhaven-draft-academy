import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  onClose: () => void;
  maxWidth?: string;
  children: ReactNode;
}

export function Modal({ onClose, maxWidth = "460px", children }: ModalProps) {
  return createPortal(
    <div
      className="animate-fade-in fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-3 sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-gold/20 bg-background-panel/90 p-4 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-7"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
