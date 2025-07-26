
import React from 'react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { PromptGeneratorDashboard } from '@/components/Admin/PromptGenerator/PromptGeneratorDashboard';

const AdminPromptGenerator: React.FC = () => {
  return (
    <AdminPageLayout
      title="Painel Técnico do Desenvolvedor"
      description="Gere e implemente funcionalidades automaticamente usando IA"
    >
      <PromptGeneratorDashboard />
    </AdminPageLayout>
  );
};

export default AdminPromptGenerator;
