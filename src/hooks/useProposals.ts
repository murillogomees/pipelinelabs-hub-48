import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProposalItem {
  product_id?: string;
  service_id?: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

export interface Proposal {
  id: string;
  company_id: string;
  customer_id?: string;
  proposal_number: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  title: string;
  description?: string;
  expiration_date?: string;
  items: ProposalItem[];
  services: ProposalItem[];
  subtotal: number;
  discount: number;
  tax_amount: number;
  total_amount: number;
  payment_terms?: string;
  delivery_terms?: string;
  notes?: string;
  internal_notes?: string;
  pdf_url?: string;
  pdf_generated_at?: string;
  sent_at?: string;
  accepted_at?: string;
  rejected_at?: string;
  converted_to_sale_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    name: string;
  };
}

export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Proposal[];
    },
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (proposal: Partial<Proposal>) => {
      // Gerar número da proposta
      const { data: companyData } = await supabase.rpc('get_user_company_id');
      const { data: proposalNumber } = await supabase.rpc('generate_proposal_number', {
        company_uuid: companyData
      });

      const { data, error } = await (supabase as any)
        .from('proposals')
        .insert([{
          ...proposal,
          proposal_number: proposalNumber,
          company_id: companyData,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast({
        title: 'Proposta criada',
        description: 'A proposta foi criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Proposal> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast({
        title: 'Proposta atualizada',
        description: 'A proposta foi atualizada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useConvertProposalToSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (proposalId: string) => {
      // Buscar a proposta
      const { data: proposal, error: proposalError } = await (supabase as any)
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (proposalError) throw proposalError;

      // Criar venda baseada na proposta
      const { data: companyData } = await supabase.rpc('get_user_company_id');
      const { data: saleNumber } = await supabase.rpc('generate_pos_sale_number', {
        company_uuid: companyData
      });

      const { data: sale, error: saleError } = await (supabase as any)
        .from('sales')
        .insert([{
          company_id: proposal.company_id,
          customer_id: proposal.customer_id,
          sale_number: saleNumber,
          total_amount: proposal.total_amount,
          subtotal: proposal.subtotal,
          discount: proposal.discount,
          status: 'pending',
          notes: `Convertida da proposta ${proposal.proposal_number}`,
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Atualizar proposta como aceita e convertida
      const { error: updateError } = await (supabase as any)
        .from('proposals')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          converted_to_sale_id: sale.id,
        })
        .eq('id', proposalId);

      if (updateError) throw updateError;

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: 'Proposta convertida',
        description: 'A proposta foi convertida em venda com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}