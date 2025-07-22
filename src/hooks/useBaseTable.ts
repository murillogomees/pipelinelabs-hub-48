import { useState, useMemo, useCallback } from 'react';

interface UseBaseTableProps<T> {
  data: T[];
  searchFields?: (keyof T)[];
  sortableFields?: (keyof T)[];
  filterableFields?: (keyof T)[];
}

interface SortConfig<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

export const useBaseTable = <T extends Record<string, any>>({
  data,
  searchFields = [],
  sortableFields = [],
  filterableFields = []
}: UseBaseTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  // Filtrar dados
  const filteredData = useMemo(() => {
    let result = [...data];

    // Aplicar busca
    if (searchTerm && searchFields.length > 0) {
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value && filterableFields.includes(key as keyof T)) {
        result = result.filter(item => {
          const itemValue = item[key as keyof T];
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });

    // Aplicar ordenação
    if (sortConfig && sortableFields.includes(sortConfig.field)) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, filters, searchFields, sortableFields, filterableFields]);

  // Handlers
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleSort = useCallback((field: keyof T) => {
    if (!sortableFields.includes(field)) return;
    
    setSortConfig(current => {
      if (current?.field === field) {
        return current.direction === 'asc' 
          ? { field, direction: 'desc' }
          : null;
      }
      return { field, direction: 'asc' };
    });
  }, [sortableFields]);

  const handleFilter = useCallback((field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({});
    setSortConfig(null);
  }, []);

  const handleSelectItem = useCallback((item: T) => {
    setSelectedItems(prev => {
      const isSelected = prev.find(selected => selected.id === item.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== item.id);
      }
      return [...prev, item];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...filteredData]);
    }
  }, [selectedItems, filteredData]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Stats
  const stats = useMemo(() => ({
    total: data.length,
    filtered: filteredData.length,
    selected: selectedItems.length,
    hasFilters: searchTerm || Object.values(filters).some(v => v),
    hasSorting: sortConfig !== null
  }), [data.length, filteredData.length, selectedItems.length, searchTerm, filters, sortConfig]);

  return {
    // Data
    data: filteredData,
    originalData: data,
    
    // State
    searchTerm,
    sortConfig,
    filters,
    selectedItems,
    
    // Handlers
    handleSearch,
    handleSort,
    handleFilter,
    clearFilters,
    handleSelectItem,
    handleSelectAll,
    clearSelection,
    
    // Utils
    stats,
    isSelected: (item: T) => selectedItems.some(selected => selected.id === item.id),
    isAllSelected: selectedItems.length === filteredData.length && filteredData.length > 0
  };
};