interface NotificationProps {
  message: string | null;
}

export function Notification({ message }: NotificationProps) {
  if (!message) return null;
  return (
    <div className="animate-slide-down fixed top-5 left-1/2 z-[2000] max-w-[90vw] -translate-x-1/2 overflow-hidden text-ellipsis rounded-lg bg-gold/95 px-6 py-3 font-sans text-sm font-semibold whitespace-nowrap text-ink shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      {message}
    </div>
  );
}
