
import { useGenericManager } from './useGenericManager';
import { useCurrentCompany } from './useCurrentCompany';

interface SimpleProductData {
  id?: string;
  name: string;
  description?: string;
  code: string;
  price?: number;
  cost_price?: number;
  stock_quantity?: number;
  min_stock?: number;
  max_stock?: number;
  unit?: string;
  barcode?: string;
  is_active?: boolean;
  weight?: number;
  dimensions?: string;
  supplier_id?: string;
}

interface SearchFilters {
  query?: string;
  is_active?: boolean;
  low_stock?: boolean;
  out_of_stock?: boolean;
  supplier_id?: string;
  min_price?: number;
  max_price?: number;
}

export function useProductsManager() {
  const { data: currentCompanyData } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;

  const baseManager = useGenericManager<any, SimpleProductData, Partial<SimpleProductData>, SearchFilters>({
    tableName: 'products',
    queryKey: 'products',
    orderBy: { column: 'created_at', ascending: false },
    transformCreate: (data: SimpleProductData, companyId: string) => ({
      name: data.name,
      description: data.description,
      code: data.code,
      price: data.price,
      cost_price: data.cost_price,
      stock_quantity: data.stock_quantity || 0,
      min_stock: data.min_stock,
      max_stock: data.max_stock,
      unit: data.unit,
      barcode: data.barcode,
      is_active: data.is_active ?? true,
      weight: data.weight,
      dimensions: data.dimensions,
      supplier_id: data.supplier_id,
      company_id: companyId
    })
  });

  return {
    ...baseManager,
    products: baseManager.items,
    createProduct: baseManager.createItem,
    updateProduct: baseManager.updateItem,
    deleteProduct: baseManager.deleteItem,
    searchProducts: baseManager.searchItems,
    refreshProducts: baseManager.refreshItems,
    getProductById: baseManager.getItemById,
    activeProducts: baseManager.activeItems,
    inactiveProducts: baseManager.inactiveItems,
    lowStockProducts: baseManager.items.filter((p: any) => 
      Number(p.stock_quantity || 0) <= Number(p.min_stock || 0)),
    outOfStockProducts: baseManager.items.filter((p: any) => 
      Number(p.stock_quantity || 0) === 0),
    totalProducts: baseManager.totalItems
  };
}
