
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePlans } from "@/hooks/usePlans";
import { PlanDialog } from "@/components/Admin/PlanDialog";

import { Search, Plus, Crown, Users, Check, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  user_limit: number | null;
  trial_days: number;
  features: string[];
  active: boolean;
}

export function AdminPlanos() {
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const { 
    plans, 
    isLoading, 
    createPlan, 
    updatePlan, 
    deletePlan,
    isCreating,
    isUpdating,
    isDeleting
  } = usePlans();

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPlanDialog(true);
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setShowPlanDialog(true);
  };

  const handleSavePlan = async (planData: Omit<Plan, 'id'>) => {
    if (selectedPlan) {
      await updatePlan({ ...planData, id: selectedPlan.id });
    } else {
      await createPlan(planData);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    await deletePlan(planId);
  };

  const totalRevenue = plans.reduce((acc, plan) => acc + (plan.price * 10), 0); // Mock multiplier

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestão de Planos</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Configure e gerencie os planos de assinatura do sistema
            </p>
          </div>
        </div>
        
        <Button onClick={handleCreatePlan} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Total de Planos</p>
                <p className="text-2xl font-bold">{plans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Planos Ativos</p>
                <p className="text-2xl font-bold">{plans.filter(p => p.active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-medium">Maior Preço</p>
                <p className="text-2xl font-bold">R$ {Math.max(...plans.map(p => p.price), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium">Receita Estimada</p>
                <p className="text-2xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Planos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Crown className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum plano encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? 'Nenhum plano corresponde à sua busca.' : 'Comece criando seu primeiro plano de assinatura.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreatePlan}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Plano
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <span>{plan.name}</span>
                </CardTitle>
                <Badge variant={plan.active ? 'default' : 'destructive'}>
                  {plan.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">por mês</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Período de teste:</span>
                  <span className="font-medium">{plan.trial_days} dias</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Limite de usuários:</span>
                  <span className="font-medium">
                    {plan.user_limit ? `${plan.user_limit} usuários` : 'Ilimitado'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Funcionalidades:</h4>
                <div className="space-y-1">
                  {(plan.features as string[]).slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {(plan.features as string[]).length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{(plan.features as string[]).length - 3} funcionalidades
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditPlan(plan)}
                  className="flex-1"
                  disabled={isUpdating}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o plano "{plan.name}"? 
                        Esta ação não pode ser desfeita e pode afetar assinantes ativos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive text-destructive-foreground"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Plan Dialog */}
      <PlanDialog
        open={showPlanDialog}
        onOpenChange={setShowPlanDialog}
        plan={selectedPlan}
        onSave={handleSavePlan}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
