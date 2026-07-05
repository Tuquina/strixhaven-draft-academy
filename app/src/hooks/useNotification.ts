import { useCallback, useRef, useState } from "react";

export function useNotification() {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const notify = useCallback((text: string) => {
    setMessage(text);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMessage(null), 3000);
  }, []);

  return { message, notify };
}
