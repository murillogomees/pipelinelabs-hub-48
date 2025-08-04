import { Building2 } from 'lucide-react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { CompaniesManagement } from '@/components/Admin/CompaniesManagement';

export default function AdminEmpresas() {
  return (
    <AdminPageLayout
      title="Gestão de Empresas"
      description="Gerencie empresas cadastradas no sistema"
      icon={<Building2 className="w-8 h-8" />}
    >
      <CompaniesManagement />
    </AdminPageLayout>
  );
}