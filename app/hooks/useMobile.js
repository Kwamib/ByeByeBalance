'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for detecting mobile viewport.
 * Returns true when viewport width < 768px.
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
