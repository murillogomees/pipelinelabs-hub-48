import { Users } from 'lucide-react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { UsersManagement } from '@/components/Admin/UsersManagement';

export default function AdminUsuarios() {
  return (
    <AdminPageLayout
      title="Gestão de Usuários"
      description="Gerencie usuários do sistema, níveis de acesso e permissões"
      icon={<Users className="w-8 h-8" />}
    >
      <UsersManagement />
    </AdminPageLayout>
  );
}