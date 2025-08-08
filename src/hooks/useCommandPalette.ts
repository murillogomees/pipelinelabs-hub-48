
import { useState } from 'react';

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  const openPalette = () => setOpen(true);

  return {
    open,
    setOpen,
    openPalette,
  };
}
