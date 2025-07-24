import { AdminPageLayout } from "@/components/Admin/AdminPageLayout";
import { UsersManagement } from "@/components/Admin/UsersManagement";
import { CompanyManagement } from "@/components/Admin/CompanyManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2 } from "lucide-react";

export default function AdminUsuarios() {
  return (
    <AdminPageLayout
      title="Gerenciamento de Usuários e Empresas"
      description="Gerencie usuários e empresas do sistema"
    >
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <CompanyManagement />
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
}