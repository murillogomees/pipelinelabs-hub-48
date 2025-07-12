import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, BarChart3 } from "lucide-react";

interface ReportsHeaderProps {
  currentView: 'list' | 'builder' | 'viewer';
  onCreateReport: () => void;
  onBackToList: () => void;
}

export function ReportsHeader({ currentView, onCreateReport, onBackToList }: ReportsHeaderProps) {
  const getTitle = () => {
    switch (currentView) {
      case 'builder':
        return 'Criar / Editar Relatório';
      case 'viewer':
        return 'Visualizar Relatório';
      default:
        return 'Relatórios';
    }
  };

  const getDescription = () => {
    switch (currentView) {
      case 'builder':
        return 'Configure os dados e visualizações do seu relatório personalizado';
      case 'viewer':
        return 'Análise detalhada dos dados do seu relatório';
      default:
        return 'Crie relatórios dinâmicos baseados nas suas prioridades de gestão';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {currentView !== 'list' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackToList}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{getTitle()}</h1>
            <p className="text-muted-foreground">{getDescription()}</p>
          </div>
        </div>
      </div>

      {currentView === 'list' && (
        <Button onClick={onCreateReport} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Novo Relatório</span>
        </Button>
      )}
    </div>
  );
}