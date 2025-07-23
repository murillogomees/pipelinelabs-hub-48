import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.string(),
  product_id: z.string().min(1, "Produto é obrigatório"),
  product_name: z.string().min(1, "Nome do produto é obrigatório"),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  unit_price: z.number().min(0, "Preço unitário deve ser maior ou igual a 0"),
  total_price: z.number().min(0, "Total deve ser maior ou igual a 0"),
  notes: z.string().optional(),
});

export const newItemFormSchema = z.object({
  product_id: z.string().min(1, "Selecione um produto"),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  unit_price: z.number().min(0, "Preço unitário deve ser maior ou igual a 0"),
  notes: z.string().optional(),
});

export const purchaseOrderFormSchema = z.object({
  supplier_id: z.string().min(1, "Fornecedor é obrigatório"),
  supplier_name: z.string().min(1, "Nome do fornecedor é obrigatório"),
  order_date: z.string().min(1, "Data do pedido é obrigatória"),
  delivery_date: z.string().optional(),
  status: z.enum(['draft', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled']),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  discount: z.number().min(0, "Desconto deve ser maior ou igual a 0"),
  tax_amount: z.number().min(0, "Impostos devem ser maior ou igual a 0"),
  shipping_cost: z.number().min(0, "Frete deve ser maior ou igual a 0"),
  items: z.array(orderItemSchema).min(1, "Adicione pelo menos um item ao pedido"),
});

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderFormSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type NewItemFormData = z.infer<typeof newItemFormSchema>;