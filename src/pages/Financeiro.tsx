import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Componente para Contas a Pagar
function ContasPagar() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Contas a Pagar</h2>
          <p className="text-muted-foreground">Gerencie suas obrigações financeiras</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <TrendingDown className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Contas a Pagar em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de contas a pagar estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para Contas a Receber
function ContasReceber() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Contas a Receber</h2>
          <p className="text-muted-foreground">Gerencie seus recebimentos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Contas a Receber em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de contas a receber estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para Conciliação
function Conciliacao() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Conciliação</h2>
          <p className="text-muted-foreground">Concilie suas contas bancárias</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Conciliação em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de conciliação bancária estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal Financeiro
export function Financeiro() {
  const location = useLocation();
  
  // Determina a aba ativa baseada na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/pagar')) return 'pagar';
    if (path.includes('/receber')) return 'receber';
    if (path.includes('/conciliacao')) return 'conciliacao';
    return 'pagar'; // padrão
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
        <p className="text-muted-foreground">Gerencie suas finanças</p>
      </div>

      <Tabs value={getActiveTab()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pagar" asChild>
            <NavLink to="/financeiro/pagar" className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4" />
              <span>A Pagar</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="receber" asChild>
            <NavLink to="/financeiro/receber" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>A Receber</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="conciliacao" asChild>
            <NavLink to="/financeiro/conciliacao" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Conciliação</span>
            </NavLink>
          </TabsTrigger>
        </TabsList>

        <Routes>
          <Route index element={<ContasPagar />} />
          <Route path="pagar" element={<ContasPagar />} />
          <Route path="receber" element={<ContasReceber />} />
          <Route path="conciliacao" element={<Conciliacao />} />
        </Routes>
      </Tabs>
    </div>
  );
}