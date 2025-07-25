import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBillingPlans, BillingPlan } from "@/hooks/useBillingPlans";
import { Plus, Edit, Trash2, Users, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface PlanDialogProps {
  plan?: BillingPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

function PlanDialog({ plan, open, onOpenChange, onSave }: PlanDialogProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    description: plan?.description || "",
    price: plan?.price || 0,
    interval: plan?.interval || "month",
    max_users: plan?.max_users || null,
    features: plan?.features || [],
  });

  const [newFeature, setNewFeature] = useState("");

  const availableFeatures = [
    "Dashboard",
    "Vendas",
    "Produtos",
    "Clientes", 
    "Compras",
    "Estoque",
    "Financeiro",
    "Notas Fiscais",
    "Produção",
    "Contratos",
    "Relatórios",
    "Analytics",
    "Marketplace Canais",
    "Integrações",
    "Configurações"
  ];

  // Atualizar formulário quando o plano mudar
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || "",
        description: plan.description || "",
        price: plan.price || 0,
        interval: plan.interval || "month",
        max_users: plan.max_users || null,
        features: plan.features || [],
      });
    } else {
      // Limpar formulário para novo plano
      setFormData({
        name: "",
        description: "",
        price: 0,
        interval: "month",
        max_users: null,
        features: [],
      });
    }
    setNewFeature("");
  }, [plan, open]); // Reagir tanto ao plan quanto ao open para garantir atualização

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{plan ? "Editar Plano" : "Novo Plano"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Plano</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Básico, Premium..."
              />
            </div>
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o que está incluído neste plano..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="interval">Intervalo de Cobrança</Label>
              <Select
                value={formData.interval}
                onValueChange={(value) => setFormData(prev => ({ ...prev, interval: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mensal</SelectItem>
                  <SelectItem value="year">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="max_users">Máximo de Usuários (-1 = Ilimitado)</Label>
              <Input
                id="max_users"
                type="number"
                value={formData.max_users || ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  max_users: e.target.value ? parseInt(e.target.value) : null 
                }))}
                placeholder="Deixe vazio para ilimitado"
              />
            </div>
          </div>

          <div>
            <Label>Funcionalidades do Sistema</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Selecione as funcionalidades que estarão disponíveis neste plano
            </p>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-md p-3">
              {availableFeatures.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature}
                    checked={formData.features.includes(feature)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData(prev => ({
                          ...prev,
                          features: [...prev.features, feature]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          features: prev.features.filter(f => f !== feature)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={feature} className="text-sm cursor-pointer">
                    {feature}
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="mt-3">
              <Label className="text-sm font-medium">Funcionalidades Personalizadas</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Digite uma funcionalidade personalizada..."
                  onKeyPress={(e) => e.key === "Enter" && handleAddFeature()}
                />
                <Button type="button" onClick={handleAddFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.features.filter(f => !availableFeatures.includes(f)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.features
                    .filter(f => !availableFeatures.includes(f))
                    .map((feature, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(formData.features.indexOf(feature))}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {plan ? "Atualizar" : "Criar"} Plano
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BillingPlansManager() {
  const { plans, createPlan, updatePlan, deletePlan, isLoading } = useBillingPlans();
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreatePlan = async (planData: any) => {
    await createPlan({ ...planData, active: true });
  };

  const handleUpdatePlan = async (planData: any) => {
    if (selectedPlan) {
      await updatePlan({ ...planData, id: selectedPlan.id });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm("Tem certeza que deseja desativar este plano?")) {
      await deletePlan(planId);
    }
  };

  const openCreateDialog = () => {
    setSelectedPlan(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (plan: BillingPlan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div>Carregando planos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Planos de Cobrança</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os planos disponíveis para as empresas
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(plan.price)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{plan.interval === "month" ? "mês" : "ano"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {plan.max_users === -1 || plan.max_users === null 
                    ? "Usuários ilimitados" 
                    : `Até ${plan.max_users} usuários`}
                </div>

                <div className="space-y-1">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-3 w-3 text-green-500" />
                      {feature}
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{plan.features.length - 3} funcionalidades
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PlanDialog
        plan={selectedPlan}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={selectedPlan ? handleUpdatePlan : handleCreatePlan}
      />
    </div>
  );
}