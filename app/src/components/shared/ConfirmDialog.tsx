import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal onClose={onCancel} maxWidth="400px">
      <div className="text-center">
        {icon && <div className="mb-3 text-5xl">{icon}</div>}
        <h2 className="m-0 mb-2.5 font-heading text-lg font-bold text-parchment">
          {title}
        </h2>
        <p className="m-0 mb-6 font-body text-sm leading-relaxed text-parchment/45">
          {message}
        </p>
        <div className="flex gap-2.5">
          {danger ? (
            <button
              onClick={onConfirm}
              className="flex-1 cursor-pointer rounded-lg border-none bg-danger py-3 text-sm font-bold text-white hover:bg-danger-dark"
            >
              {confirmLabel}
            </button>
          ) : (
            <Button variant="primary" fullWidth onClick={onConfirm} className="font-heading text-sm py-3">
              {confirmLabel}
            </Button>
          )}
          <Button variant="ghost" onClick={onCancel} className="border-white/12 text-parchment/45 hover:bg-white/4 py-3 px-4.5">
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
