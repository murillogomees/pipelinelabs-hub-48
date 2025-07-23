// Hook de compatibilidade para PDV - redireciona para useSales unificado
import { 
  usePOSSales, 
  useCreatePOSSale, 
  useUpdateSale as useUpdatePOSSale 
} from './useSales';

// Re-export interfaces para compatibilidade
export interface POSItem {
  product_id: string;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

export interface POSPayment {
  method: 'money' | 'pix' | 'card' | 'boleto';
  amount: number;
  details?: string;
}

export interface POSSale {
  id: string;
  company_id: string;
  customer_id?: string;
  sale_number: string;
  total_amount: number;
  discount: number;
  tax_amount: number;
  items: POSItem[];
  payments: POSPayment[];
  status: 'completed' | 'cancelled';
  receipt_printed: boolean;
  nfce_issued: boolean;
  nfce_key?: string;
  notes?: string;
  operator_id?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    name: string;
  };
}

// Re-export hooks unificados
export { usePOSSales, useCreatePOSSale, useUpdatePOSSale };