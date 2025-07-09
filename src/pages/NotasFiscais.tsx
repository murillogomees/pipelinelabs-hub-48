import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Receipt, Building } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Componente para NFe
function NFe() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">NFe - Nota Fiscal Eletrônica</h2>
          <p className="text-muted-foreground">Emita notas fiscais eletrônicas</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nova NFe
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">NFe em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de emissão de NFe estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para NFCe
function NFCe() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">NFCe - Nota Fiscal do Consumidor</h2>
          <p className="text-muted-foreground">Emita cupons fiscais eletrônicos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nova NFCe
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">NFCe em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de emissão de NFCe estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para NFSe
function NFSe() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">NFSe - Nota Fiscal de Serviços</h2>
          <p className="text-muted-foreground">Emita notas fiscais de serviços</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nova NFSe
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">NFSe em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de emissão de NFSe estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal Notas Fiscais
export function NotasFiscais() {
  const location = useLocation();
  
  // Determina a aba ativa baseada na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/nfe')) return 'nfe';
    if (path.includes('/nfce')) return 'nfce';
    if (path.includes('/nfse')) return 'nfse';
    return 'nfe'; // padrão
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notas Fiscais</h1>
        <p className="text-muted-foreground">Emita e gerencie notas fiscais</p>
      </div>

      <Tabs value={getActiveTab()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nfe" asChild>
            <NavLink to="/notas-fiscais/nfe" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>NFe</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="nfce" asChild>
            <NavLink to="/notas-fiscais/nfce" className="flex items-center space-x-2">
              <Receipt className="w-4 h-4" />
              <span>NFCe</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="nfse" asChild>
            <NavLink to="/notas-fiscais/nfse" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>NFSe</span>
            </NavLink>
          </TabsTrigger>
        </TabsList>

        <Routes>
          <Route index element={<NFe />} />
          <Route path="nfe" element={<NFe />} />
          <Route path="nfce" element={<NFCe />} />
          <Route path="nfse" element={<NFSe />} />
        </Routes>
      </Tabs>
    </div>
  );
}