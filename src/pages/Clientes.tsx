import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Building2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Componente para Clientes
function ClientesLista() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clientes</h2>
          <p className="text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Clientes em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de gestão de clientes estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para Fornecedores
function Fornecedores() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fornecedores</h2>
          <p className="text-muted-foreground">Gerencie seus fornecedores</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Fornecedores em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de gestão de fornecedores estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal Clientes
export function Clientes() {
  const location = useLocation();
  
  // Determina a aba ativa baseada na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/fornecedores')) return 'fornecedores';
    return 'clientes'; // padrão
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
        <p className="text-muted-foreground">Gerencie clientes e fornecedores</p>
      </div>

      <Tabs value={getActiveTab()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clientes" asChild>
            <NavLink to="/clientes" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Clientes</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="fornecedores" asChild>
            <NavLink to="/clientes/fornecedores" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Fornecedores</span>
            </NavLink>
          </TabsTrigger>
        </TabsList>

        <Routes>
          <Route index element={<ClientesLista />} />
          <Route path="fornecedores" element={<Fornecedores />} />
        </Routes>
      </Tabs>
    </div>
  );
}