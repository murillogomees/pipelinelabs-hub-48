import { z } from 'zod';

export const productSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  cost_price: z.number().min(0, 'Preço de custo deve ser maior ou igual a zero').optional().nullable(),
  weight: z.number().min(0, 'Peso deve ser maior ou igual a zero').optional().nullable(),
  dimensions: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  ncm_code: z.string().optional().nullable(),
  tax_origin: z.string().optional().nullable(),
  tax_situation: z.string().optional().nullable(),
  stock_quantity: z.number().int().min(0, 'Quantidade deve ser maior ou igual a zero').optional(),
  min_stock: z.number().int().min(0, 'Estoque mínimo deve ser maior ou igual a zero').optional().nullable(),
  max_stock: z.number().int().min(0, 'Estoque máximo deve ser maior ou igual a zero').optional().nullable(),
  stock_location: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;