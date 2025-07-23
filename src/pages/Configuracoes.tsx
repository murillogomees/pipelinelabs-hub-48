import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Building2, Receipt, DollarSign, Shield, Palette, Settings } from 'lucide-react';
import { 
  EmpresaTab, 
  FiscalTab, 
  FinanceiroTab, 
  CertificadoTab, 
  PersonalizacaoTab, 
  SistemaTab 
} from '@/components/Configuracoes';

export default function Configuracoes() {
  return (
    <div className="space-mobile">
      <div>
        <h1 className="heading-mobile font-bold">Configurações</h1>
        <p className="text-mobile text-muted-foreground">Gerencie as configurações da sua empresa</p>
      </div>

      <Card className="card-mobile">
        <Tabs defaultValue="empresa" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="empresa" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="fiscal" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Fiscal</span>
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="certificado" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Certificado</span>
            </TabsTrigger>
            <TabsTrigger value="personalizacao" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Personalização</span>
            </TabsTrigger>
            <TabsTrigger value="sistema" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Sistema</span>
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
  );
}