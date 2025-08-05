
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Outlet } from 'react-router-dom';

// Core Pages
import Dashboard from '@/pages/Dashboard';
import Clientes from '@/pages/Clientes';
import Produtos from '@/pages/Produtos';
import Vendas from '@/pages/Vendas';
import Compras from '@/pages/Compras';
import Financeiro from '@/pages/Financeiro';
import Estoque from '@/pages/Estoque';
import Relatorios from '@/pages/Relatorios';
import Configuracoes from '@/pages/Configuracoes';
import Analytics from '@/pages/Analytics';
import Producao from '@/pages/Producao';
import NotasFiscais from '@/pages/NotasFiscais';
import ConfiguracaoNFe from '@/pages/ConfiguracaoNFe';
import Integracoes from '@/pages/Integracoes';
import ConfiguracoesIntegracoes from '@/pages/ConfiguracoesIntegracoes';
import MarketplaceChannels from '@/pages/MarketplaceChannels';
import Notificacoes from '@/pages/Notificacoes';
import Subscription from '@/pages/Subscription';

export function AppRoutes() {
  return (
    <Route 
      path="/app" 
      element={
        <ProtectedRoute>
          <MainLayout>
            <Outlet />
          </MainLayout>
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/app/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="clientes" element={<Clientes />} />
      <Route path="produtos" element={<Produtos />} />
      <Route path="vendas" element={<Vendas />} />
      <Route path="compras" element={<Compras />} />
      <Route path="financeiro" element={<Financeiro />} />
      <Route path="estoque" element={<Estoque />} />
      <Route path="relatorios" element={<Relatorios />} />
      <Route path="configuracoes" element={<Configuracoes />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="producao" element={<Producao />} />
      <Route path="notas-fiscais" element={<NotasFiscais />} />
      <Route path="configuracao-nfe" element={<ConfiguracaoNFe />} />
      <Route path="integracoes" element={<Integracoes />} />
      <Route path="configuracoes-integracoes" element={<ConfiguracoesIntegracoes />} />
      <Route path="marketplace-channels" element={<MarketplaceChannels />} />
      <Route path="notificacoes" element={<Notificacoes />} />
      <Route path="subscription" element={<Subscription />} />
    </Route>
  );
}
