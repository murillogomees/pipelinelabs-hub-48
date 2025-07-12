import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { ReportsHeader } from "@/components/Reports/ReportsHeader";
import { ReportsList } from "@/components/Reports/ReportsList";
import { ReportBuilder } from "@/components/Reports/ReportBuilder";
import { ReportViewer } from "@/components/Reports/ReportViewer";

export function Relatorios() {
  const [currentView, setCurrentView] = useState<'list' | 'builder' | 'viewer'>('list');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleCreateReport = () => {
    setCurrentView('builder');
    setSelectedReportId(null);
  };

  const handleEditReport = (id: string) => {
    setCurrentView('builder');
    setSelectedReportId(id);
  };

  const handleViewReport = (id: string) => {
    setCurrentView('viewer');
    setSelectedReportId(id);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedReportId(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <ReportsHeader 
          currentView={currentView}
          onCreateReport={handleCreateReport}
          onBackToList={handleBackToList}
        />
        
        {currentView === 'list' && (
          <ReportsList 
            onEditReport={handleEditReport}
            onViewReport={handleViewReport}
          />
        )}
        
        {currentView === 'builder' && (
          <ReportBuilder 
            reportId={selectedReportId}
            onSave={handleBackToList}
            onCancel={handleBackToList}
          />
        )}
        
        {currentView === 'viewer' && selectedReportId && (
          <ReportViewer 
            reportId={selectedReportId}
            onEdit={() => handleEditReport(selectedReportId)}
            onBack={handleBackToList}
          />
        )}
      </div>
    </MainLayout>
  );
}