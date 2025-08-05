
export interface SearchFilters {
  search?: string;
  query?: string;
  category?: string;
  status?: 'active' | 'inactive';
  is_active?: boolean;
  minPrice?: number;
  maxPrice?: number;
  min_price?: number;
  max_price?: number;
  lowStock?: boolean;
  low_stock?: boolean;
  out_of_stock?: boolean;
}

export interface ProductFilters extends SearchFilters {
  // Herda todas as propriedades de SearchFilters
}
