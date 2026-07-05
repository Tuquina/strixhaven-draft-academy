import { Modal } from "./Modal";
import { MatchTimerPanel } from "./MatchTimerPanel";

interface MatchTimerModalProps {
  playerAName?: string;
  playerBName?: string;
  onClose: () => void;
}

export function MatchTimerModal({ playerAName, playerBName, onClose }: MatchTimerModalProps) {
  return (
    <Modal onClose={onClose} maxWidth="520px">
      <MatchTimerPanel playerAName={playerAName} playerBName={playerBName} onClose={onClose} />
    </Modal>
  );
}
