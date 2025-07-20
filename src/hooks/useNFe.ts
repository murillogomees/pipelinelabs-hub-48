import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NFe {
  id: string;
  company_id: string;
  invoice_id?: string;
  xml_content: string;
  xml_signature?: string;
  protocol_number?: string;
  access_key?: string;
  qr_code?: string;
  pdf_url?: string;
  status: 'draft' | 'sent' | 'authorized' | 'canceled' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface NFeItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  item_code: string;
  item_description: string;
  ncm_code?: string;
  quantity: number;
  unit_value: number;
  total_value: number;
  icms_base?: number;
  icms_value?: number;
  icms_percentage?: number;
  pis_base?: number;
  pis_value?: number;
  pis_percentage?: number;
  cofins_base?: number;
  cofins_value?: number;
  cofins_percentage?: number;
  ipi_base?: number;
  ipi_value?: number;
  ipi_percentage?: number;
  created_at: string;
}

export interface CreateNFeData {
  customer_id?: string;
  items: Omit<NFeItem, 'id' | 'invoice_id' | 'created_at'>[];
  issue_date: string;
  series?: string;
}

export const useNFe = () => {
  const queryClient = useQueryClient();

  const { data: nfeList = [], isLoading } = useQuery({
    queryKey: ['nfe'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (
            name,
            document
          ),
          nfe_xmls (
            *
          )
        `)
        .eq('invoice_type', 'NFE')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createNFe = useMutation({
    mutationFn: async (data: CreateNFeData) => {
      // 1. Obter usuário e company_id
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const { data: userCompany, error: companyError } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', userData.user?.id)
        .eq('is_active', true)
        .single();

      if (companyError) throw companyError;

      // 2. Gerar número da NFe
      const { data: nfeNumber, error: numberError } = await supabase
        .rpc('generate_nfe_number', {
          company_uuid: userCompany.company_id,
          serie_nfe: data.series || '001'
        });

      if (numberError) throw numberError;

      // 3. Criar a invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          company_id: userCompany.company_id,
          invoice_type: 'NFE',
          invoice_number: nfeNumber,
          series: data.series || '001',
          customer_id: data.customer_id,
          issue_date: data.issue_date,
          status: 'draft',
          total_amount: data.items.reduce((sum, item) => sum + item.total_value, 0),
          tax_amount: 0,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // 4. Criar os itens da NFe
      const itemsWithInvoiceId = data.items.map(item => ({
        ...item,
        invoice_id: invoice.id,
      }));

      const { error: itemsError } = await supabase
        .from('nfe_items')
        .insert(itemsWithInvoiceId);

      if (itemsError) throw itemsError;

      // 5. Criar registro XML inicial
      const { error: xmlError } = await supabase
        .from('nfe_xmls')
        .insert({
          company_id: userCompany.company_id,
          invoice_id: invoice.id,
          xml_content: '<xml>Aguardando processamento...</xml>',
          status: 'draft',
        });

      if (xmlError) throw xmlError;

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nfe'] });
      toast.success('NFe criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar NFe:', error);
      toast.error('Erro ao criar NFe');
    },
  });

  const sendNFe = useMutation({
    mutationFn: async (invoiceId: string) => {
      // Aqui integraria com NFE.io ou outro provedor
      const { error } = await supabase
        .from('nfe_xmls')
        .update({ status: 'sent' })
        .eq('invoice_id', invoiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nfe'] });
      toast.success('NFe enviada para processamento!');
    },
    onError: () => {
      toast.error('Erro ao enviar NFe');
    },
  });

  const cancelNFe = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from('nfe_xmls')
        .update({ status: 'canceled' })
        .eq('invoice_id', invoiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nfe'] });
      toast.success('NFe cancelada!');
    },
    onError: () => {
      toast.error('Erro ao cancelar NFe');
    },
  });

  return {
    nfeList,
    isLoading,
    createNFe,
    sendNFe,
    cancelNFe,
  };
};