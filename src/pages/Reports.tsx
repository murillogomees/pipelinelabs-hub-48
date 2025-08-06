
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Reports() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios e Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Módulo de relatórios em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
