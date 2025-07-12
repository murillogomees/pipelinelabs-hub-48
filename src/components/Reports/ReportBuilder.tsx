import { useState, useEffect } from "react";
import { useReports, Report } from "@/hooks/useReports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Save, X } from "lucide-react";

interface ReportBuilderProps {
  reportId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  description: string;
  chart_type: string;
  data_sources: string[];
  metrics: string[];
  filters: Record<string, any>;
}

const availableDataSources = [
  { id: 'sales', label: 'Vendas', description: 'Dados de vendas e transações' },
  { id: 'products', label: 'Produtos', description: 'Informações sobre produtos' },
  { id: 'customers', label: 'Clientes', description: 'Dados dos clientes' },
  { id: 'invoices', label: 'Notas Fiscais', description: 'Documentos fiscais emitidos' },
  { id: 'accounts_receivable', label: 'Contas a Receber', description: 'Valores a receber' },
  { id: 'accounts_payable', label: 'Contas a Pagar', description: 'Valores a pagar' },
];

const availableMetrics = [
  { id: 'total_amount', label: 'Valor Total', sources: ['sales', 'invoices', 'accounts_receivable', 'accounts_payable'] },
  { id: 'quantity', label: 'Quantidade', sources: ['sales', 'products'] },
  { id: 'count', label: 'Contagem', sources: ['sales', 'customers', 'products', 'invoices'] },
  { id: 'average', label: 'Média', sources: ['sales', 'products'] },
  { id: 'growth', label: 'Crescimento', sources: ['sales', 'customers'] },
  { id: 'stock_quantity', label: 'Estoque', sources: ['products'] },
];

const chartTypes = [
  { id: 'bar', label: 'Gráfico de Barras' },
  { id: 'line', label: 'Gráfico de Linha' },
  { id: 'pie', label: 'Gráfico de Pizza' },
];

export function ReportBuilder({ reportId, onSave, onCancel }: ReportBuilderProps) {
  const { reports, createReport, updateReport } = useReports();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    chart_type: 'bar',
    data_sources: [],
    metrics: [],
    filters: {},
  });

  const isEditing = !!reportId;
  const existingReport = reports.find(r => r.id === reportId);

  useEffect(() => {
    if (existingReport) {
      setFormData({
        name: existingReport.name,
        description: existingReport.description || '',
        chart_type: existingReport.chart_type,
        data_sources: existingReport.data_sources,
        metrics: existingReport.metrics,
        filters: (existingReport.filters as Record<string, any>) || {},
      });
    }
  }, [existingReport]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;
    if (formData.data_sources.length === 0) return;
    if (formData.metrics.length === 0) return;

    setLoading(true);
    
    try {
      const reportData = {
        name: formData.name,
        description: formData.description,
        chart_type: formData.chart_type,
        data_sources: formData.data_sources,
        metrics: formData.metrics,
        filters: formData.filters,
        config: {},
        is_active: true,
        created_by: null,
      };

      if (isEditing && reportId) {
        await updateReport(reportId, reportData);
      } else {
        await createReport(reportData);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataSourceChange = (sourceId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      data_sources: checked 
        ? [...prev.data_sources, sourceId]
        : prev.data_sources.filter(id => id !== sourceId),
      metrics: prev.metrics.filter(metric => {
        const metricConfig = availableMetrics.find(m => m.id === metric);
        return metricConfig && (checked 
          ? metricConfig.sources.includes(sourceId) || prev.data_sources.some(ds => metricConfig.sources.includes(ds))
          : prev.data_sources.filter(id => id !== sourceId).some(ds => metricConfig.sources.includes(ds))
        );
      })
    }));
  };

  const handleMetricChange = (metricId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      metrics: checked 
        ? [...prev.metrics, metricId]
        : prev.metrics.filter(id => id !== metricId)
    }));
  };

  const getAvailableMetrics = () => {
    return availableMetrics.filter(metric => 
      formData.data_sources.some(source => metric.sources.includes(source))
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações Básicas */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Defina as informações básicas do seu relatório
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Relatório *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Relatório de Vendas Mensais"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o objetivo deste relatório"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chart-type">Tipo de Gráfico</Label>
                <Select value={formData.chart_type} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, chart_type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de gráfico" />
                  </SelectTrigger>
                  <SelectContent>
                    {chartTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Fontes de Dados */}
          <Card>
            <CardHeader>
              <CardTitle>Fontes de Dados *</CardTitle>
              <CardDescription>
                Selecione as tabelas que contêm os dados para seu relatório
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableDataSources.map((source) => (
                  <div key={source.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={source.id}
                      checked={formData.data_sources.includes(source.id)}
                      onCheckedChange={(checked) => 
                        handleDataSourceChange(source.id, !!checked)
                      }
                    />
                    <div className="flex-1 space-y-1">
                      <Label htmlFor={source.id} className="font-medium cursor-pointer">
                        {source.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {source.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métricas */}
          {formData.data_sources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Métricas *</CardTitle>
                <CardDescription>
                  Escolha as métricas que deseja analisar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getAvailableMetrics().map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={metric.id}
                        checked={formData.metrics.includes(metric.id)}
                        onCheckedChange={(checked) => 
                          handleMetricChange(metric.id, !!checked)
                        }
                      />
                      <Label htmlFor={metric.id} className="font-medium cursor-pointer">
                        {metric.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview/Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nome:</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.name || 'Não definido'}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium">Tipo de Gráfico:</Label>
                <p className="text-sm text-muted-foreground">
                  {chartTypes.find(t => t.id === formData.chart_type)?.label}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium">Fontes de Dados:</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.data_sources.length > 0 
                    ? formData.data_sources.map(id => 
                        availableDataSources.find(s => s.id === id)?.label
                      ).join(', ')
                    : 'Nenhuma selecionada'
                  }
                </p>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium">Métricas:</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.metrics.length > 0 
                    ? formData.metrics.map(id => 
                        availableMetrics.find(m => m.id === id)?.label
                      ).join(', ')
                    : 'Nenhuma selecionada'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim() || formData.data_sources.length === 0 || formData.metrics.length === 0}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Relatório'}
            </Button>
            
            <Button type="button" variant="outline" onClick={onCancel} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}