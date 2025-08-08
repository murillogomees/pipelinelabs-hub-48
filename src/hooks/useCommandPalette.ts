
import { useState, useEffect } from 'react';

export const useCommandPalette = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return {
    open,
    setOpen,
    toggle: () => setOpen(!open),
    close: () => setOpen(false),
    openPalette: () => setOpen(true)
  };
};
