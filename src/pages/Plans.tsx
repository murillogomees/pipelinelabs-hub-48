import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Crown, Star, Zap, Briefcase } from "lucide-react";
import { PlanDialog } from "@/components/Plans/PlanDialog";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  user_limit: number;
  trial_days: number;
  features: string[];
  is_custom: boolean;
  active: boolean;
}

const planIcons = {
  "Plano Básico": Zap,
  "Plano Econômico": Briefcase,
  "Plano Completo": Star,
  "Plano Exclusivo": Crown,
};

export function Plans() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  const { data: plans, isLoading, refetch } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("active", true)
        .order("price");
      
      if (error) throw error;
      return data as Plan[];
    },
  });

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedPlan(null);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    await refetch();
    setIsDialogOpen(false);
    setSelectedPlan(null);
    toast({
      title: "Sucesso",
      description: "Plano salvo com sucesso!",
    });
  };

  const formatPrice = (price: number, isCustom: boolean) => {
    if (isCustom) return "Sob orçamento";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getPlanIcon = (planName: string) => {
    const IconComponent = planIcons[planName as keyof typeof planIcons] || Star;
    return <IconComponent className="h-8 w-8" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Planos</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Planos</h1>
          <p className="text-muted-foreground">Gerencie os planos de assinatura do sistema</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans?.map((plan) => (
          <Card key={plan.id} className="relative hover:shadow-lg transition-shadow duration-200">
            {plan.name === "Plano Completo" && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                Mais Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 text-primary">
                {getPlanIcon(plan.name)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="text-center">
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  {formatPrice(plan.price, plan.is_custom)}
                </span>
                {!plan.is_custom && <span className="text-muted-foreground">/mês</span>}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>
                    {plan.user_limit === -1 
                      ? "Usuários ilimitados" 
                      : `${plan.user_limit} usuário${plan.user_limit > 1 ? 's' : ''}`
                    }
                  </span>
                </div>

                {plan.trial_days > 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{plan.trial_days} dias grátis</span>
                  </div>
                )}

                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleEdit(plan)}
              >
                Editar Plano
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <PlanDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        plan={selectedPlan}
        onSave={handleSave}
      />
    </div>
  );
}