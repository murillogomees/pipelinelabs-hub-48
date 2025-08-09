import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

export type Report = Tables<'reports'>;

export interface ReportData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }>;
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar relatórios",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData: any) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single();

      if (error) throw error;
      
      setReports(prev => [data, ...prev]);
      toast({
        title: "Relatório criado",
        description: "Relatório criado com sucesso!",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar relatório",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateReport = async (id: string, updates: Partial<Report>) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setReports(prev => prev.map(report => 
        report.id === id ? { ...report, ...data } : report
      ));
      
      toast({
        title: "Relatório atualizado",
        description: "Relatório atualizado com sucesso!",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar relatório",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setReports(prev => prev.filter(report => report.id !== id));
      toast({
        title: "Relatório removido",
        description: "Relatório removido com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover relatório",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getReportData = async (report: Report): Promise<ReportData> => {
    return {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [{
        label: report.metrics[0] || 'Dados',
        data: [10, 20, 15, 30, 25, 40],
        backgroundColor: ['hsl(var(--primary))'],
        borderColor: ['hsl(var(--primary))'],
      }],
    };
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    createReport,
    updateReport,
    deleteReport,
    getReportData,
    refetch: fetchReports,
  };
}