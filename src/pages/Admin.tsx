import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard, Users, Palette } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Componente para Planos
function Planos() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Planos</h2>
          <p className="text-muted-foreground">Gerencie planos e assinaturas</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Planos em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de gestão de planos estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para Usuários
function Usuarios() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Usuários</h2>
          <p className="text-muted-foreground">Gerencie usuários do sistema</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Usuários em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de gestão de usuários estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para Whitelabel
function Whitelabel() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Whitelabel</h2>
          <p className="text-muted-foreground">Configure a marca do sistema</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Whitelabel em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de personalização whitelabel estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal Admin
export function Admin() {
  const location = useLocation();
  
  // Determina a aba ativa baseada na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/planos')) return 'planos';
    if (path.includes('/usuarios')) return 'usuarios';
    if (path.includes('/whitelabel')) return 'whitelabel';
    return 'planos'; // padrão
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie configurações do sistema</p>
      </div>

      <Tabs value={getActiveTab()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="planos" asChild>
            <NavLink to="/admin/planos" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Planos</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="usuarios" asChild>
            <NavLink to="/admin/usuarios" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Usuários</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="whitelabel" asChild>
            <NavLink to="/admin/whitelabel" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Whitelabel</span>
            </NavLink>
          </TabsTrigger>
        </TabsList>

        <Routes>
          <Route index element={<Planos />} />
          <Route path="planos" element={<Planos />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="whitelabel" element={<Whitelabel />} />
        </Routes>
      </Tabs>
    </div>
  );
}