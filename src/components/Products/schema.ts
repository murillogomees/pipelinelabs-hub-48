import { z } from 'zod';

export const productSchema = z.object({
  // Campos obrigatórios
  code: z.string().min(1, 'Código é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  
  // Campos básicos opcionais
  description: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  product_type: z.string().default('produto'),
  brand: z.string().optional().nullable(),
  unit: z.string().default('un'),
  condition: z.string().default('novo'),
  format: z.string().default('simples'),
  production_type: z.string().default('propria'),
  expiry_date: z.string().optional().nullable(),
  free_shipping: z.boolean().default(false),
  
  // Campos financeiros
  cost_price: z.number().min(0, 'Preço de custo deve ser maior ou igual a zero').optional().nullable(),
  promotional_price: z.number().min(0, 'Preço promocional deve ser maior ou igual a zero').optional().nullable(),
  
  // Campos físicos
  weight: z.number().min(0, 'Peso deve ser maior ou igual a zero').optional().nullable(),
  gross_weight: z.number().min(0, 'Peso bruto deve ser maior ou igual a zero').optional().nullable(),
  volumes: z.number().int().min(1, 'Volumes deve ser maior que zero').default(1),
  height: z.number().min(0, 'Altura deve ser maior ou igual a zero').optional().nullable(),
  width: z.number().min(0, 'Largura deve ser maior ou igual a zero').optional().nullable(),
  depth: z.number().min(0, 'Profundidade deve ser maior ou igual a zero').optional().nullable(),
  unit_measure: z.string().default('cm'),
  dimensions: z.string().optional().nullable(),
  
  // Identificação
  barcode: z.string().optional().nullable(),
  
  // Fiscais
  ncm_code: z.string().optional().nullable(),
  cest_code: z.string().optional().nullable(),
  tax_origin: z.string().optional().nullable(),
  tax_situation: z.string().optional().nullable(),
  item_type: z.string().optional().nullable(),
  product_group: z.string().optional().nullable(),
  
  // Tributos
  icms_base: z.number().min(0).optional().nullable(),
  icms_retention: z.number().min(0).optional().nullable(),
  pis_fixed: z.number().min(0).optional().nullable(),
  cofins_fixed: z.number().min(0).optional().nullable(),
  estimated_tax_percentage: z.number().min(0).max(100).optional().nullable(),
  tipi_exception: z.string().optional().nullable(),
  
  // Estoque
  stock_quantity: z.number().int().min(0, 'Quantidade deve ser maior ou igual a zero').default(0),
  min_stock: z.number().int().min(0, 'Estoque mínimo deve ser maior ou igual a zero').optional().nullable(),
  max_stock: z.number().int().min(0, 'Estoque máximo deve ser maior ou igual a zero').optional().nullable(),
  stock_location: z.string().optional().nullable(),
  stock_notes: z.string().optional().nullable(),
  crossdocking_days: z.number().int().min(0).default(0),
  warehouse: z.string().optional().nullable(),
  
  // Links e observações
  external_link: z.string().url('Link deve ser uma URL válida').optional().or(z.literal('')),
  video_link: z.string().url('Link deve ser uma URL válida').optional().or(z.literal('')),
  observations: z.string().optional().nullable(),
  
  // Categoria
  category_id: z.string().optional().nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;