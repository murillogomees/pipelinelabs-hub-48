
export interface ProductFilters {
  search?: string;
  category?: string;
  status?: 'active' | 'inactive';
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
}

export interface SearchFilters {
  search?: string;
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
}
