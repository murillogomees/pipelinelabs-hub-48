import { AnalyticsDashboard } from '@/components/Analytics';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

export default function Analytics() {
  const { canViewReports, isLoading } = usePermissions();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!canViewReports) {
    return (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar os analytics.
        </AlertDescription>
      </Alert>
    );
  }

  return <AnalyticsDashboard />;
}