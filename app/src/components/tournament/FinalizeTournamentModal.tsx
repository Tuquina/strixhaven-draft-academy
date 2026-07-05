import { ConfirmDialog } from "../shared/ConfirmDialog";

interface FinalizeTournamentModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function FinalizeTournamentModal({ onConfirm, onCancel }: FinalizeTournamentModalProps) {
  return (
    <ConfirmDialog
      icon="🏆"
      title="Finalizar torneo"
      message="¿Querés finalizar este torneo? Podrás ver el podio y conservar los resultados."
      confirmLabel="Finalizar"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
