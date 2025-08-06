
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserProfile() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Perfil do Usuário</h1>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Página de perfil do usuário em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
