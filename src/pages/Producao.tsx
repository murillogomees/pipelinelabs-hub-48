import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wrench, ClipboardList } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Componente para Ordens de Produção (padrão)
function OrdensProducao() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ordens de Produção</h2>
          <p className="text-muted-foreground">Gerencie a produção de produtos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nova Ordem
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ordens de Produção em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de ordens de produção estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para Ordens de Serviço
function OrdensServico() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ordens de Serviço</h2>
          <p className="text-muted-foreground">Gerencie ordens de serviço</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nova OS
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ordens de Serviço em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de ordens de serviço estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal Produção
export function Producao() {
  const location = useLocation();
  
  // Determina a aba ativa baseada na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/os')) return 'os';
    return 'producao'; // padrão
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Produção</h1>
        <p className="text-muted-foreground">Gerencie produção e ordens de serviço</p>
      </div>

      <Tabs value={getActiveTab()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="producao" asChild>
            <NavLink to="/producao" className="flex items-center space-x-2">
              <Wrench className="w-4 h-4" />
              <span>Produção</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="os" asChild>
            <NavLink to="/producao/os" className="flex items-center space-x-2">
              <ClipboardList className="w-4 h-4" />
              <span>Ordens de Serviço</span>
            </NavLink>
          </TabsTrigger>
        </TabsList>

        <Routes>
          <Route index element={<OrdensProducao />} />
          <Route path="os" element={<OrdensServico />} />
        </Routes>
      </Tabs>
    </div>
  );
}