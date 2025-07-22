import { logger } from '@/utils/logger';

// Sistema de preloading para componentes críticos
export class ComponentPreloader {
  private static preloadedComponents = new Set<string>();
  private static preloadPromises = new Map<string, Promise<any>>();

  // Componentes críticos para precarregar
  private static criticalComponents = [
    'ProductDialog',
    'CustomerDialog',
    'NFeDialog',
    'Dashboard',
    'Vendas',
    'Produtos'
  ];

  // Precarregar componentes críticos
  static async preloadCriticalComponents() {
    logger.info('Starting critical components preload...');
    
    const preloadPromises = [
      // Páginas principais
      this.preloadComponent('Dashboard', () => import('@/pages/Dashboard')),
      this.preloadComponent('Vendas', () => import('@/pages/Vendas')),
      this.preloadComponent('Produtos', () => import('@/pages/Produtos')),
      
      // Dialogs mais usados
      this.preloadComponent('ProductDialog', () => import('@/components/Products/ProductDialog')),
      this.preloadComponent('CustomerDialog', () => import('@/components/Customers/CustomerDialog')),
      this.preloadComponent('NFeDialog', () => import('@/components/NFe/NFeDialog')),
    ];

    await Promise.allSettled(preloadPromises);
    logger.info('Critical components preload completed');
  }

  // Precarregar componente específico
  static async preloadComponent(name: string, importFn: () => Promise<any>) {
    if (this.preloadedComponents.has(name)) {
      return this.preloadPromises.get(name);
    }

    const promise = importFn()
      .then(module => {
        this.preloadedComponents.add(name);
        logger.info(`Component preloaded: ${name}`);
        return module;
      })
      .catch(error => {
        logger.error(`Failed to preload component ${name}:`, error);
        throw error;
      });

    this.preloadPromises.set(name, promise);
    return promise;
  }

  // Precarregar com base na rota atual
  static async preloadByRoute(route: string) {
    const routeComponents = {
      '/dashboard': ['StatsCard', 'DashboardWidget'],
      '/vendas': ['SalesTable', 'SalesChart'],
      '/produtos': ['ProductDialog', 'ProductTable'],
      '/clientes': ['CustomerDialog', 'CustomerTable'],
      '/financeiro': ['AccountPayableDialog', 'AccountReceivableDialog'],
      '/notas-fiscais': ['NFeDialog', 'RealNFeDialog'],
      '/producao': ['ProductionOrderDialog', 'ServiceOrderDialog'],
      '/estoque': ['StockMovementDialog', 'WarehouseDialog'],
      '/compras': ['PurchaseOrderDialog'],
      '/relatorios': ['ReportBuilder', 'ReportViewer'],
      '/configuracoes': ['ConfigTabs'],
      '/integracoes': ['IntegrationCard', 'IntegrationDialog']
    };

    const components = routeComponents[route as keyof typeof routeComponents];
    if (!components) return;

    logger.info(`Preloading components for route: ${route}`);
    
    const promises = components.map(async (componentName) => {
      const importMap = {
        ProductDialog: () => import('@/components/Products/ProductDialog'),
        CustomerDialog: () => import('@/components/Customers/CustomerDialog'),
        NFeDialog: () => import('@/components/NFe/NFeDialog'),
        RealNFeDialog: () => import('@/components/NFe/RealNFeDialog'),
        PurchaseOrderDialog: () => import('@/components/Purchases/PurchaseOrderDialog'),
        AccountPayableDialog: () => import('@/components/Financial/AccountPayableDialog'),
        AccountReceivableDialog: () => import('@/components/Financial/AccountReceivableDialog'),
        ProductionOrderDialog: () => import('@/components/Production/ProductionOrderDialog'),
        ServiceOrderDialog: () => import('@/components/Production/ServiceOrderDialog'),
        StockMovementDialog: () => import('@/components/Stock/StockMovementDialog'),
        WarehouseDialog: () => import('@/components/Stock/WarehouseDialog'),
        ReportBuilder: () => import('@/components/Reports/ReportBuilder'),
        ReportViewer: () => import('@/components/Reports/ReportViewer'),
      };

      const importFn = importMap[componentName as keyof typeof importMap];
      if (importFn) {
        return this.preloadComponent(componentName, importFn);
      }
    });

    await Promise.allSettled(promises);
  }

  // Verificar se componente foi precarregado
  static isPreloaded(name: string): boolean {
    return this.preloadedComponents.has(name);
  }

  // Limpar cache de preload
  static clearPreloadCache() {
    this.preloadedComponents.clear();
    this.preloadPromises.clear();
    logger.info('Preload cache cleared');
  }
}

// Hook para usar o preloader
export const useComponentPreloader = () => {
  const preloadForRoute = (route: string) => {
    ComponentPreloader.preloadByRoute(route);
  };

  const preloadComponent = (name: string, importFn: () => Promise<any>) => {
    return ComponentPreloader.preloadComponent(name, importFn);
  };

  return {
    preloadForRoute,
    preloadComponent,
    isPreloaded: ComponentPreloader.isPreloaded.bind(ComponentPreloader),
    clearCache: ComponentPreloader.clearPreloadCache.bind(ComponentPreloader)
  };
};