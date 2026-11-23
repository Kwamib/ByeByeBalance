'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState('');
  const timer = useRef(null);
  const show = useCallback((msg, ms = 3000) => {
    setMessage(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), ms);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = <div role="status" aria-live="polite">{message ? <div id="toast">{message}</div> : null}</div>;
  return [show, node];
}
