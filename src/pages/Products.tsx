
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Products() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Módulo de produtos em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
