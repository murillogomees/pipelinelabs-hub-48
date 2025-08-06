import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SearchResult {
  id: string;
  type: 'customer' | 'product' | 'sale' | 'proposal' | 'invoice' | 'action';
  title: string;
  subtitle?: string;
  link: string;
  icon: string;
  category: string;
}

export interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  link: string;
  icon: string;
  keywords: string[];
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-sale',
    title: 'Nova Venda',
    subtitle: 'Criar uma nova venda no PDV',
    link: '/vendas',
    icon: 'ShoppingCart',
    keywords: ['nova venda', 'pdv', 'vender', 'caixa']
  },
  {
    id: 'new-proposal',
    title: 'Nova Proposta',
    subtitle: 'Criar proposta comercial',
    link: '/vendas?tab=propostas',
    icon: 'FileText',
    keywords: ['nova proposta', 'proposta', 'orçamento']
  },
  {
    id: 'new-customer',
    title: 'Novo Cliente',
    subtitle: 'Cadastrar cliente',
    link: '/clientes',
    icon: 'UserPlus',
    keywords: ['novo cliente', 'cadastrar cliente', 'cliente']
  },
  {
    id: 'new-product',
    title: 'Novo Produto',
    subtitle: 'Cadastrar produto',
    link: '/produtos',
    icon: 'Package',
    keywords: ['novo produto', 'cadastrar produto', 'produto']
  },
  {
    id: 'invoices',
    title: 'Notas Fiscais',
    subtitle: 'Gerenciar notas fiscais',
    link: '/notas-fiscais',
    icon: 'Receipt',
    keywords: ['notas fiscais', 'nfe', 'nota', 'emitir nota']
  },
  {
    id: 'financial',
    title: 'Financeiro',
    subtitle: 'Contas a pagar e receber',
    link: '/financeiro',
    icon: 'DollarSign',
    keywords: ['financeiro', 'contas', 'pagar', 'receber']
  }
];

export function useGlobalSearch(query: string) {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);

  return useQuery({
    queryKey: ['global-search', query, user?.id],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query || query.length < 2 || !user?.id) {
        return [];
      }

      setIsSearching(true);
      const results: SearchResult[] = [];
      const searchTerm = query.toLowerCase().trim();

      try {
        // Search for quick actions first
        const matchingActions = QUICK_ACTIONS.filter(action =>
          action.keywords.some(keyword => 
            keyword.toLowerCase().includes(searchTerm) ||
            action.title.toLowerCase().includes(searchTerm)
          )
        );

        matchingActions.forEach(action => {
          results.push({
            id: action.id,
            type: 'action',
            title: action.title,
            subtitle: action.subtitle,
            link: action.link,
            icon: action.icon,
            category: 'Ações Rápidas'
          });
        });

        // Search customers
        const { data: customers } = await supabase
          .from('customers')
          .select('id, name, email, document')
          .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,document.ilike.%${searchTerm}%`)
          .limit(5);

        customers?.forEach(customer => {
          results.push({
            id: customer.id,
            type: 'customer',
            title: customer.name,
            subtitle: customer.email || customer.document || '',
            link: `/clientes?id=${customer.id}`,
            icon: 'User',
            category: 'Clientes'
          });
        });

        // Search products
        const { data: products } = await supabase
          .from('products')
          .select('id, name, code, price')
          .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
          .limit(5);

        products?.forEach(product => {
          results.push({
            id: product.id,
            type: 'product',
            title: product.name,
            subtitle: `Código: ${product.code} • ${new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(product.price)}`,
            link: `/produtos?id=${product.id}`,
            icon: 'Package',
            category: 'Produtos'
          });
        });

        // Search sales
        const { data: sales } = await supabase
          .from('sales')
          .select(`
            id, 
            sale_number, 
            total_amount, 
            status,
            customers(name)
          `)
          .or(`sale_number.ilike.%${searchTerm}%`)
          .limit(5);

        sales?.forEach(sale => {
          results.push({
            id: sale.id,
            type: 'sale',
            title: `Venda ${sale.sale_number}`,
            subtitle: `${(sale.customers as any)?.name || 'Cliente não informado'} • ${new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(sale.total_amount)}`,
            link: `/vendas?id=${sale.id}`,
            icon: 'ShoppingCart',
            category: 'Vendas'
          });
        });

        // Search proposals
        const { data: proposals } = await supabase
          .from('proposals')
          .select('id, proposal_number, title, total_amount, status')
          .or(`proposal_number.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`)
          .limit(5);

        proposals?.forEach(proposal => {
          results.push({
            id: proposal.id,
            type: 'proposal',
            title: `Proposta ${proposal.proposal_number}`,
            subtitle: `${proposal.title} • ${new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(proposal.total_amount)}`,
            link: `/vendas?tab=propostas&id=${proposal.id}`,
            icon: 'FileText',
            category: 'Propostas'
          });
        });

        // Search invoices
        const { data: invoices } = await supabase
          .from('invoices')
          .select('id, invoice_number, total_amount, status')
          .or(`invoice_number.ilike.%${searchTerm}%`)
          .limit(5);

        invoices?.forEach(invoice => {
          results.push({
            id: invoice.id,
            type: 'invoice',
            title: `Nota Fiscal ${invoice.invoice_number}`,
            subtitle: `${invoice.status} • ${new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(invoice.total_amount)}`,
            link: `/notas-fiscais?id=${invoice.id}`,
            icon: 'Receipt',
            category: 'Notas Fiscais'
          });
        });

      } catch (error) {
        // Search error handled silently
      } finally {
        setIsSearching(false);
      }

      return results;
    },
    enabled: !!query && query.length >= 2 && !!user?.id,
    staleTime: 30000, // 30 seconds
  });
}