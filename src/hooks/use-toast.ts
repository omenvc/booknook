import { useCallback, useRef, useState } from 'react';

const DEFAULT_DURATION = 2000;

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string, duration = DEFAULT_DURATION) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage(text);
    timeoutRef.current = setTimeout(() => setMessage(null), duration);
  }, []);

  return { toastMessage: message, showToast };
}
