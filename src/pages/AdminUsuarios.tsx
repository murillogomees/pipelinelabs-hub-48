
import { AdminPageLayout } from "@/components/Admin/AdminPageLayout";
import { UsersManagement } from "@/components/Admin/UsersManagement";
import { SuperAdminGuard } from "@/components/PermissionGuard";
import { Users } from "lucide-react";

export default function AdminUsuarios() {
  return (
    <SuperAdminGuard>
      <AdminPageLayout
        title="Gerenciamento de Usuários"
        description="Gerencie usuários do sistema - Acesso restrito a administradores"
        icon={<Users className="h-8 w-8" />}
      >
        <UsersManagement />
      </AdminPageLayout>
    </SuperAdminGuard>
  );
}
