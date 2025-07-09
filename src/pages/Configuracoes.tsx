import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Building2, Receipt, DollarSign, Shield, Palette, Settings } from 'lucide-react';
import { EmpresaTab } from '@/components/Configuracoes/EmpresaTab';
import { FiscalTab } from '@/components/Configuracoes/FiscalTab';
import { FinanceiroTab } from '@/components/Configuracoes/FinanceiroTab';
import { CertificadoTab } from '@/components/Configuracoes/CertificadoTab';
import { PersonalizacaoTab } from '@/components/Configuracoes/PersonalizacaoTab';
import { SistemaTab } from '@/components/Configuracoes/SistemaTab';

export default function Configuracoes() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações da sua empresa</p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="empresa" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="empresa" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Empresa
              </TabsTrigger>
              <TabsTrigger value="fiscal" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Fiscal
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financeiro
              </TabsTrigger>
              <TabsTrigger value="certificado" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Certificado
              </TabsTrigger>
              <TabsTrigger value="personalizacao" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Personalização
              </TabsTrigger>
              <TabsTrigger value="sistema" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Sistema
              </TabsTrigger>
            </TabsList>

            <TabsContent value="empresa">
              <EmpresaTab />
            </TabsContent>

            <TabsContent value="fiscal">
              <FiscalTab />
            </TabsContent>

            <TabsContent value="financeiro">
              <FinanceiroTab />
            </TabsContent>

            <TabsContent value="certificado">
              <CertificadoTab />
            </TabsContent>

            <TabsContent value="personalizacao">
              <PersonalizacaoTab />
            </TabsContent>

            <TabsContent value="sistema">
              <SistemaTab />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </MainLayout>
  );
}