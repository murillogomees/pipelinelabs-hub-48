import React, { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const LazyDashboard = React.lazy(() => import('@/pages/Dashboard'));
export const LazyVendas = React.lazy(() => import('@/pages/Vendas'));
export const LazyProdutos = React.lazy(() => import('@/pages/Produtos'));
export const LazyClientes = React.lazy(() => import('@/pages/Clientes'));
export const LazyCompras = React.lazy(() => import('@/pages/Compras'));
export const LazyFinanceiro = React.lazy(() => import('@/pages/Financeiro'));
export const LazyNotasFiscais = React.lazy(() => import('@/pages/NotasFiscais'));
export const LazyProducao = React.lazy(() => import('@/pages/Producao'));
export const LazyRelatorios = React.lazy(() => import('@/pages/Relatorios'));
export const LazyAnalytics = React.lazy(() => import('@/pages/Analytics'));
export const LazyMarketplaceChannels = React.lazy(() => import('@/pages/MarketplaceChannels'));
export const LazyConfiguracoes = React.lazy(() => import('@/pages/Configuracoes'));
export const LazyConfiguracaoNFe = React.lazy(() => import('@/pages/ConfiguracaoNFe'));
export const LazyConfiguracoesIntegracoes = React.lazy(() => import('@/pages/ConfiguracoesIntegracoes'));
export const LazyUserDadosPessoais = React.lazy(() => import('@/pages/UserDadosPessoais'));
export const LazyAdmin = React.lazy(() => import('@/pages/Admin'));
export const LazyAdminUsuarios = React.lazy(() => import('@/pages/AdminUsuarios'));
export const LazyAdminIntegracoes = React.lazy(() => import('@/pages/AdminIntegracoes'));
export const LazyAdminNotificacoes = React.lazy(() => import('@/pages/AdminNotificacoes'));
export const LazyAdminBackup = React.lazy(() => import('@/pages/AdminBackup'));
export const LazyAdminCache = React.lazy(() => import('@/pages/AdminCache'));
export const LazyAdminCompressao = React.lazy(() => import('@/pages/AdminCompressao'));
export const LazyAdminMonitoramento = React.lazy(() => import('@/pages/AdminMonitoramento'));
export const LazyAdminVersions = React.lazy(() => import('@/pages/AdminVersions'));
export const LazyAdminAuditLogs = React.lazy(() => import('@/pages/AdminAuditLogs'));
export const LazyAdminLandingPage = React.lazy(() => import('@/pages/AdminLandingPage'));
export const LazyAdminEngineeringNotes = React.lazy(() => import('@/pages/AdminEngineeringNotes'));
export const LazyTermosDeUso = React.lazy(() => import('@/pages/TermosDeUso'));
export const LazyPrivacidade = React.lazy(() => import('@/pages/Privacidade'));
export const LazyNotFound = React.lazy(() => import('@/pages/NotFound'));

export const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  }>
    {children}
  </Suspense>
);
