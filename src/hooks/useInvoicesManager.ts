import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';
import { useToast } from './use-toast';
import { useCache } from './useCache';

interface InvoiceData {
  id?: string;
  invoice_number?: string;
  invoice_type: 'NFE' | 'NFCE' | 'SERVICE';
  customer_id?: string;
  sale_id?: string;
  issue_date: string;
  total_amount: number;
  tax_amount?: number;
  status: 'draft' | 'issued' | 'sent' | 'cancelled';
  series?: string;
  access_key?: string;
  xml_content?: string;
  pdf_url?: string;
}

interface InvoiceValidation {
  isValid: boolean;
  isDuplicate: boolean;
  existingInvoice?: any;
}

interface InvoiceAnalytics {
  totalInvoices: number;
  totalAmount: number;
  averageAmount: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  recentInvoices: any[];
}

interface SearchFilters {
  query?: string;
  customer_id?: string;
  invoice_type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

export function useInvoicesManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  
  const { data: currentCompanyData } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cache para lista de notas fiscais com filtros
  const cacheKey = `invoices-${currentCompany?.id}-${JSON.stringify(filters)}-${page}`;
  const { 
    data: invoicesData, 
    invalidateCache: invalidateInvoicesCache,
    updateCache: updateInvoicesCache,
    isLoading: isCacheLoading
  } = useCache({
    key: cacheKey,
    fetcher: async () => {
      if (!currentCompany?.id) return { invoices: [], count: 0 };

      let query = supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(name, document),
          sale:sales(sale_number)
        `, { count: 'exact' })
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (filters.query) {
        query = query.or(`invoice_number.ilike.%${filters.query}%`);
      }

      if (filters.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }

      if (filters.invoice_type) {
        query = query.eq('invoice_type', filters.invoice_type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.date_from) {
        query = query.gte('issue_date', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('issue_date', filters.date_to);
      }

      if (filters.min_amount !== undefined) {
        query = query.gte('total_amount', filters.min_amount);
      }

      if (filters.max_amount !== undefined) {
        query = query.lte('total_amount', filters.max_amount);
      }

      const offset = (page - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        invoices: data || [],
        count: count || 0
      };
    },
    ttl: 300000, // 5 minutos
    enabled: !!currentCompany?.id
  });

  const invoices = invoicesData?.invoices || [];
  const totalInvoices = invoicesData?.count || 0;

  const validateInvoice = useCallback(async (invoiceData: Partial<InvoiceData>, invoiceId?: string): Promise<InvoiceValidation> => {
    setIsValidating(true);
    
    try {
      // Validar número único por série e tipo
      if (invoiceData.invoice_number && invoiceData.invoice_type) {
        const { data: existing } = await supabase
          .from('invoices')
          .select('id, invoice_number')
          .eq('invoice_number', invoiceData.invoice_number)
          .eq('invoice_type', invoiceData.invoice_type)
          .eq('series', invoiceData.series || '001')
          .eq('company_id', currentCompany?.id)
          .neq('id', invoiceId || '');

        if (existing && existing.length > 0) {
          return {
            isValid: false,
            isDuplicate: true,
            existingInvoice: existing[0]
          };
        }
      }

      return { isValid: true, isDuplicate: false };
    } catch (error) {
      console.error('Error validating invoice:', error);
      toast({
        title: 'Erro na validação',
        description: 'Erro ao validar nota fiscal',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [currentCompany?.id, toast]);

  const createInvoice = useCallback(async (invoiceData: InvoiceData): Promise<any> => {
    setIsLoading(true);
    
    try {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }

      // Gerar número da nota fiscal se não fornecido
      if (!invoiceData.invoice_number) {
        const { data: invoiceNumber } = await supabase.rpc('generate_nfe_number', {
          company_uuid: currentCompany.id,
          serie_nfe: invoiceData.series || '001'
        });
        invoiceData.invoice_number = invoiceNumber;
      }

      // Validações
      const validation = await validateInvoice(invoiceData);
      if (!validation.isValid) {
        throw new Error('Número de nota fiscal já existe');
      }

      // Gerar chave de acesso se for NFe
      if (invoiceData.invoice_type === 'NFE' && !invoiceData.access_key) {
        const { data: accessKey } = await supabase.rpc('generate_nfe_access_key', {
          company_cnpj: currentCompany.document || '',
          serie_nfe: invoiceData.series || '001',
          numero_nfe: invoiceData.invoice_number,
          emission_date: invoiceData.issue_date
        });
        invoiceData.access_key = accessKey;
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          company_id: currentCompany.id,
          series: invoiceData.series || '001'
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidar caches relacionados
      await Promise.all([
        invalidateInvoicesCache(),
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      ]);

      toast({
        title: 'Sucesso',
        description: 'Nota fiscal criada com sucesso'
      });

      return data;
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar nota fiscal',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, validateInvoice, invalidateInvoicesCache, queryClient, toast]);

  const updateInvoice = useCallback(async (invoiceId: string, invoiceData: Partial<InvoiceData>): Promise<any> => {
    setIsLoading(true);
    
    try {
      // Validações se estiver alterando número
      if (invoiceData.invoice_number) {
        const validation = await validateInvoice(invoiceData, invoiceId);
        if (!validation.isValid) {
          throw new Error('Número de nota fiscal já existe');
        }
      }

      const { data, error } = await supabase
        .from('invoices')
        .update({
          ...invoiceData,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .eq('company_id', currentCompany?.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar cache local
      if (invoicesData?.invoices) {
        const updatedList = invoicesData.invoices.map(i => 
          i.id === invoiceId ? { ...i, ...data } : i
        );
        updateInvoicesCache({ ...invoicesData, invoices: updatedList });
      }

      toast({
        title: 'Sucesso',
        description: 'Nota fiscal atualizada com sucesso'
      });

      return data;
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar nota fiscal',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, validateInvoice, invoicesData, updateInvoicesCache, toast]);

  const cancelInvoice = useCallback(async (invoiceId: string, reason?: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .eq('company_id', currentCompany?.id);

      if (error) throw error;

      // Atualizar cache local
      if (invoicesData?.invoices) {
        const updatedList = invoicesData.invoices.map(i => 
          i.id === invoiceId ? { ...i, status: 'cancelled' } : i
        );
        updateInvoicesCache({ ...invoicesData, invoices: updatedList });
      }

      toast({
        title: 'Sucesso',
        description: 'Nota fiscal cancelada com sucesso'
      });
    } catch (error: any) {
      console.error('Error cancelling invoice:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao cancelar nota fiscal',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, invoicesData, updateInvoicesCache, toast]);

  const getInvoiceAnalytics = useCallback(async (): Promise<InvoiceAnalytics | null> => {
    try {
      if (!currentCompany?.id) return null;

      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('status, invoice_type, total_amount, created_at')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!invoicesData) return null;

      const totalInvoices = invoicesData.length;
      const totalAmount = invoicesData.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
      const averageAmount = totalInvoices > 0 ? totalAmount / totalInvoices : 0;

      const byStatus = invoicesData.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byType = invoicesData.reduce((acc, inv) => {
        acc[inv.invoice_type] = (acc[inv.invoice_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalInvoices,
        totalAmount,
        averageAmount,
        byStatus,
        byType,
        recentInvoices: invoicesData.slice(0, 10)
      };
    } catch (error) {
      console.error('Error fetching invoice analytics:', error);
      return null;
    }
  }, [currentCompany?.id]);

  const searchInvoices = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset para primeira página
  }, []);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const refreshInvoices = useCallback(async () => {
    await invalidateInvoicesCache();
  }, [invalidateInvoicesCache]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    if (!currentCompany?.id) return;

    const interval = setInterval(() => {
      refreshInvoices();
    }, 300000);

    return () => clearInterval(interval);
  }, [currentCompany?.id, refreshInvoices]);

  return {
    // Estados
    isLoading: isLoading || isCacheLoading,
    isValidating,
    invoices,
    totalInvoices,
    filters,
    page,
    pageSize,

    // Funções principais
    createInvoice,
    updateInvoice,
    cancelInvoice,
    searchInvoices,
    loadMore,

    // Validações
    validateInvoice,

    // Analytics
    getInvoiceAnalytics,
    refreshInvoices,

    // Utilitários
    getInvoiceById: useCallback((id: string) => 
      invoices.find(i => i.id === id), [invoices]
    ),

    // Estatísticas
    hasMorePages: invoices.length < totalInvoices,
    currentPage: page,
    totalPages: Math.ceil(totalInvoices / pageSize),

    // Filtros auxiliares
    draftInvoices: invoices.filter(i => i.status === 'draft'),
    issuedInvoices: invoices.filter(i => i.status === 'issued'),
    cancelledInvoices: invoices.filter(i => i.status === 'cancelled'),

    // Status
    isEmpty: invoices.length === 0,
    isFiltered: Object.keys(filters).some(key => filters[key as keyof SearchFilters])
  };
}
