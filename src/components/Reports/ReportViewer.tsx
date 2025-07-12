import { useState, useEffect } from "react";
import { useReports, ReportData } from "@/hooks/useReports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ReportChart } from "./ReportChart";
import { Edit, RefreshCw, Download } from "lucide-react";

interface ReportViewerProps {
  reportId: string;
  onEdit: () => void;
  onBack: () => void;
}

export function ReportViewer({ reportId, onEdit }: ReportViewerProps) {
  const { reports, getReportData } = useReports();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const report = reports.find(r => r.id === reportId);

  const loadReportData = async () => {
    if (!report) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getReportData(report);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [report]);

  if (!report) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Relatório não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Relatório */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{report.name}</CardTitle>
              {report.description && (
                <CardDescription className="text-base">
                  {report.description}
                </CardDescription>
              )}
              
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary">
                  {report.chart_type === 'bar' && 'Gráfico de Barras'}
                  {report.chart_type === 'line' && 'Gráfico de Linha'}
                  {report.chart_type === 'pie' && 'Gráfico de Pizza'}
                </Badge>
                
                {report.data_sources.map((source) => (
                  <Badge key={source} variant="outline">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={loadReportData} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {report.metrics.map((metric, index) => (
          <Card key={metric}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {metric}
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : reportData ? (
                  <p className="text-2xl font-bold">
                    {reportData.datasets[0]?.data?.[index] || 0}
                  </p>
                ) : (
                  <p className="text-2xl font-bold text-muted-foreground">--</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visualização dos Dados</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="space-y-4 text-center">
                <Skeleton className="h-4 w-48 mx-auto" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          ) : error ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center space-y-4">
                <p className="text-destructive font-medium">Erro ao carregar dados</p>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={loadReportData} variant="outline">
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : reportData ? (
            <div className="h-96">
              <ReportChart 
                data={reportData} 
                type={report.chart_type} 
              />
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Fontes de Dados</h4>
              <div className="space-y-1">
                {report.data_sources.map((source) => (
                  <Badge key={source} variant="outline">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Métricas</h4>
              <div className="space-y-1">
                {report.metrics.map((metric) => (
                  <Badge key={metric} variant="outline">
                    {metric}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}