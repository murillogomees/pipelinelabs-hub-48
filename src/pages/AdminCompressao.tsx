import React from 'react';
import { CompressionMonitor } from '@/components/Admin/CompressionMonitor';

export function AdminCompressao() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Monitor de Compressão HTTP</h1>
        <p className="text-muted-foreground">
          Acompanhe a performance da compressão Gzip e Brotli no sistema Pipeline Labs
        </p>
      </div>
      
      <CompressionMonitor />
    </div>
  );
}