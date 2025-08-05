
import { useGenericManager } from './useGenericManager';

export interface Sale {
  id: string;
  sale_number: string;
  customer_name?: string;
  total_amount: number;
  status: string;
  sale_date: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function useSalesManager() {
  const genericManager = useGenericManager<Sale>('sales');

  return {
    sales: genericManager.items,
    loading: genericManager.loading,
    isLoading: genericManager.isLoading,
    error: genericManager.error,
    createSale: genericManager.createItem,
    updateSale: genericManager.updateItem,
    deleteSale: genericManager.deleteItem,
    fetchSales: genericManager.fetchItems,
    allSales: genericManager.items,
  };
}
