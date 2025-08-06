
import React from 'react';
import { Input } from '@/components/ui/input';

export function GlobalSearchTrigger() {
  return (
    <Input
      type="search"
      placeholder="Buscar..."
      className="max-w-sm"
    />
  );
}
