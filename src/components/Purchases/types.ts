export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface PurchaseOrderFormData {
  supplier_id: string;
  supplier_name: string;
  order_date: string;
  delivery_date: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  notes: string;
  internal_notes: string;
  discount: number;
  tax_amount: number;
  shipping_cost: number;
  items: OrderItem[];
  subtotal: number;
  total_amount: number;
}

export interface PurchaseOrder extends PurchaseOrderFormData {
  id: string;
  order_number: string;
  created_by: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface NewItemFormData {
  product_id: string;
  quantity: number;
  unit_price: number;
  notes: string;
}