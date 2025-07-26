
import { AdminPageLayout } from "@/components/Admin/AdminPageLayout";
import { AccessLevelsManagement } from "@/components/Admin/AccessLevels/AccessLevelsManagement";
import { Shield } from "lucide-react";

export default function AdminNiveisAcesso() {
  return (
    <AdminPageLayout
      title="Níveis de Acesso"
      description="Gerencie os diferentes níveis de acesso e suas permissões no sistema"
      icon={<Shield className="h-6 w-6" />}
    >
      <AccessLevelsManagement />
    </AdminPageLayout>
  );
}
