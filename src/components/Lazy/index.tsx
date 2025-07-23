import React, { Suspense } from 'react';
import { logger } from '@/utils/logger';

// Loading component para componentes lazy
const ComponentLoader = ({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const containerClasses = {
    small: 'min-h-[100px]',
    default: 'min-h-[200px]',
    large: 'min-h-[400px]'
  };

  return (
    <div className={`flex items-center justify-center ${containerClasses[size]}`}>
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-primary`}></div>
    </div>
  );
};

// HOC para criar componentes lazy com loading
export const createLazyComponent = (
  importFn: () => Promise<any>,
  name: string,
  loaderSize: 'small' | 'default' | 'large' = 'default',
  exportName?: string
) => {
  const LazyComponent = React.lazy(async () => {
    try {
      const module = await importFn();
      logger.info(`Lazy component loaded: ${name}`);
      
      // Se o componente tem um export nomeado específico
      if (exportName && module[exportName]) {
        return { default: module[exportName] };
      }
      
      // Se já tem default export
      if (module.default) {
        return module;
      }
      
      // Se não tem default, usa o primeiro export nomeado
      const firstExport = Object.values(module).find(
        (exp: any) => typeof exp === 'function' || typeof exp === 'object'
      );
      
      if (firstExport) {
        return { default: firstExport };
      }
      
      throw new Error(`No valid export found for ${name}`);
    } catch (error) {
      logger.error(`Failed to load lazy component ${name}:`, error);
      throw error;
    }
  });

  const ComponentWithSuspense = (props: any) => (
    <Suspense fallback={<ComponentLoader size={loaderSize} />}>
      <LazyComponent {...props} />
    </Suspense>
  );

  ComponentWithSuspense.displayName = `Lazy(${name})`;
  return ComponentWithSuspense;
};

// Lazy components para dialogs grandes
export const LazyProductDialog = createLazyComponent(
  () => import('@/components/Products/ProductDialog'),
  'ProductDialog',
  'large'
);

export const LazyCustomerDialog = createLazyComponent(
  () => import('@/components/Customers/CustomerDialog'),
  'CustomerDialog',
  'default'
);

export const LazySupplierDialog = createLazyComponent(
  () => import('@/components/Suppliers/SupplierDialog'),
  'SupplierDialog',
  'default'
);


export const LazyRealNFeDialog = createLazyComponent(
  () => import('@/components/NFe/RealNFeDialog'),
  'RealNFeDialog',
  'large'
);

export const LazyPurchaseOrderDialog = createLazyComponent(
  () => import('@/components/Purchases/PurchaseOrderDialog'),
  'PurchaseOrderDialog',
  'large'
);

export const LazyAccountPayableDialog = createLazyComponent(
  () => import('@/components/Financial/AccountPayableDialog'),
  'AccountPayableDialog',
  'default'
);

export const LazyAccountReceivableDialog = createLazyComponent(
  () => import('@/components/Financial/AccountReceivableDialog'),
  'AccountReceivableDialog',
  'default'
);

export const LazyProductionOrderDialog = createLazyComponent(
  () => import('@/components/Production/ProductionOrderDialog'),
  'ProductionOrderDialog',
  'large'
);

export const LazyServiceOrderDialog = createLazyComponent(
  () => import('@/components/Production/ServiceOrderDialog'),
  'ServiceOrderDialog',
  'large'
);

export const LazyStockMovementDialog = createLazyComponent(
  () => import('@/components/Stock/StockMovementDialog'),
  'StockMovementDialog',
  'default'
);

export const LazyWarehouseDialog = createLazyComponent(
  () => import('@/components/Stock/WarehouseDialog'),
  'WarehouseDialog',
  'default'
);

export const LazyContractDialog = createLazyComponent(
  () => import('@/components/Contracts/ContractDialog'),
  'ContractDialog',
  'default'
);

export const LazyProposalDialog = createLazyComponent(
  () => import('@/components/Proposals/ProposalDialog'),
  'ProposalDialog',
  'default'
);

// Lazy components para páginas administrativas
export const LazyUserDialog = createLazyComponent(
  () => import('@/components/Admin/UserDialog'),
  'UserDialog',
  'large'
);

export const LazyCompanyDialog = createLazyComponent(
  () => import('@/components/Admin/CompanyDialog'),
  'CompanyDialog',
  'default'
);

export const LazyPlanDialog = createLazyComponent(
  () => import('@/components/Admin/PlanDialog'),
  'PlanDialog',
  'default'
);

export const LazyIntegrationDialog = createLazyComponent(
  () => import('@/components/Admin/Integrations/IntegrationDialog'),
  'IntegrationDialog',
  'large'
);

// Lazy components para relatórios
export const LazyReportBuilder = createLazyComponent(
  () => import('@/components/Reports/ReportBuilder'),
  'ReportBuilder',
  'large'
);

export const LazyReportViewer = createLazyComponent(
  () => import('@/components/Reports/ReportViewer'),
  'ReportViewer',
  'large'
);

// Lazy components para configurações
export const LazyPOSInterface = createLazyComponent(
  () => import('@/components/POS/POSInterface'),
  'POSInterface',
  'large'
);

export const LazyGlobalSearchDialog = createLazyComponent(
  () => import('@/components/Search/GlobalSearchDialog'),
  'GlobalSearchDialog',
  'default'
);

export const LazyUserProfileDialog = createLazyComponent(
  () => import('@/components/User/UserProfileDialog'),
  'UserProfileDialog',
  'default'
);


export const LazyPlanSubscriptionDialog = createLazyComponent(
  () => import('@/components/User/PlanSubscriptionDialog'),
  'PlanSubscriptionDialog',
  'default'
);