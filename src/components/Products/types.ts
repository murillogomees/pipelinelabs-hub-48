
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Product = Tables<'products'>;
export type CreateProductData = TablesInsert<'products'>;
export type UpdateProductData = { id: string } & TablesUpdate<'products'>;

export const PRODUCT_TYPES = {
  PRODUTO: 'produto',
  SERVICO: 'servico'
} as const;

export const PRODUCT_CONDITIONS = {
  NOVO: 'novo',
  USADO: 'usado',
  RECONDICIONADO: 'recondicionado'
} as const;

export const PRODUCT_FORMATS = {
  SIMPLES: 'simples',
  VARIACAO: 'variacao',
  COMPOSICAO: 'composicao'
} as const;

export const PRODUCTION_TYPES = {
  PROPRIA: 'propria',
  TERCEIRO: 'terceiro'
} as const;

export const UNIT_MEASURES = {
  CM: 'cm',
  M: 'm',
  MM: 'mm'
} as const;

export const UNITS = {
  UNIDADE: 'un',
  PACOTE: 'pct',
  CAIXA: 'cx',
  KILOGRAMA: 'kg',
  GRAMA: 'g',
  LITRO: 'l',
  METRO: 'm'
} as const;

export const TAX_ORIGINS = {
  '0': 'Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8',
  '1': 'Estrangeira - Importação direta, exceto a indicada no código 6',
  '2': 'Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7',
  '3': 'Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%',
  '4': 'Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos',
  '5': 'Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%',
  '6': 'Estrangeira - Importação direta, sem similar nacional, constante em lista da CAMEX',
  '7': 'Estrangeira - Adquirida no mercado interno, sem similar nacional, constante lista CAMEX',
  '8': 'Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%'
} as const;

export const ITEM_TYPES = {
  MERCADORIA: 'mercadoria',
  PRODUTO: 'produto',
  SERVICO: 'servico'
} as const;
