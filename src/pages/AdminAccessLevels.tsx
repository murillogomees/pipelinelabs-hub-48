import { Shield } from 'lucide-react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { AccessLevelsManagement } from '@/components/Admin/AccessLevels/AccessLevelsManagement';

export default function AdminAccessLevels() {
  return (
    <AdminPageLayout
      title="Níveis de Acesso"
      description="Gerencie níveis de acesso e permissões do sistema"
      icon={<Shield className="w-8 h-8" />}
    >
      <AccessLevelsManagement />
    </AdminPageLayout>
  );
}