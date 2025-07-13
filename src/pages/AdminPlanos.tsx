import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { Search, Plus, Crown, Users, Check, X, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function AdminPlanos() {
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Mock data - em produção viria do hook usePlans
  const plans = [
    {
      id: "1",
      name: "Básico",
      description: "Plano ideal para pequenos negócios",
      price: 49.90,
      trial_days: 7,
      user_limit: 3,
      active: true,
      is_custom: false,
      is_whitelabel: false,
      features: ["Dashboard básico", "Vendas", "Produtos", "Clientes"],
      subscriptions_count: 45
    },
    {
      id: "2",
      name: "Profissional",
      description: "Plano completo para empresas em crescimento",
      price: 149.90,
      trial_days: 14,
      user_limit: 10,
      active: true,
      is_custom: false,
      is_whitelabel: false,
      features: ["Tudo do Básico", "Relatórios", "Integrações", "API", "Suporte prioritário"],
      subscriptions_count: 23
    },
    {
      id: "3",
      name: "Empresarial",
      description: "Solução personalizada para grandes empresas",
      price: 299.90,
      trial_days: 30,
      user_limit: null,
      active: true,
      is_custom: true,
      is_whitelabel: true,
      features: ["Tudo do Profissional", "White Label", "Usuários ilimitados", "Suporte dedicado"],
      subscriptions_count: 8
    }
  ];

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowPlanDialog(true);
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setShowPlanDialog(true);
  };

  const totalSubscriptions = plans.reduce((acc, plan) => acc + plan.subscriptions_count, 0);
  const totalRevenue = plans.reduce((acc, plan) => acc + (plan.price * plan.subscriptions_count), 0);

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
                <p className="text-sm font-medium">Assinantes</p>
                <p className="text-2xl font-bold">{totalSubscriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
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
              <div className="w-4 h-4 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium">Receita Mensal</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="relative">
            {plan.is_whitelabel && (
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  White Label
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {plan.is_custom && <Crown className="h-4 w-4 text-yellow-500" />}
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
                <div className="flex justify-between text-sm">
                  <span>Assinantes:</span>
                  <span className="font-medium">{plan.subscriptions_count}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Funcionalidades:</h4>
                <div className="space-y-1">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{plan.features.length - 3} funcionalidades
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
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
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
                      <AlertDialogAction className="bg-destructive text-destructive-foreground">
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

      {/* TODO: Implementar dialog para criar/editar plano */}
    </div>
  );
}