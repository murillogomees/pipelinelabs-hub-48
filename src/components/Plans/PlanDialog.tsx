import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const planSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.coerce.number().min(0, "Preço deve ser maior ou igual a zero"),
  description: z.string().optional(),
  user_limit: z.coerce.number().min(-1, "Limite de usuários deve ser -1 (ilimitado) ou maior que 0"),
  trial_days: z.coerce.number().min(0, "Dias de teste deve ser maior ou igual a zero"),
  is_custom: z.boolean(),
  active: z.boolean(),
});

type PlanForm = z.infer<typeof planSchema>;

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

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: Plan | null;
  onSave: () => void;
}

const defaultFeatures = [
  "Dashboard básico",
  "Gestão de vendas",
  "Controle de estoque",
  "Emissão de NFe",
  "Gestão financeira",
  "Relatórios",
  "Integrações",
  "API completa",
  "Suporte premium",
  "Usuários ilimitados",
];

export function PlanDialog({ open, onOpenChange, plan, onSave }: PlanDialogProps) {
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const { toast } = useToast();

  const form = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      user_limit: 1,
      trial_days: 0,
      is_custom: false,
      active: true,
    },
  });

  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        price: plan.price,
        description: plan.description || "",
        user_limit: plan.user_limit,
        trial_days: plan.trial_days,
        is_custom: plan.is_custom,
        active: plan.active,
      });
      setFeatures(plan.features || []);
    } else {
      form.reset({
        name: "",
        price: 0,
        description: "",
        user_limit: 1,
        trial_days: 0,
        is_custom: false,
        active: true,
      });
      setFeatures([]);
    }
  }, [plan, form]);

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFeatures(features.filter(f => f !== featureToRemove));
  };

  const toggleDefaultFeature = (feature: string) => {
    if (features.includes(feature)) {
      removeFeature(feature);
    } else {
      setFeatures([...features, feature]);
    }
  };

  const onSubmit = async (data: PlanForm) => {
    try {
      const planData = {
        name: data.name,
        price: data.price,
        description: data.description || "",
        user_limit: data.user_limit,
        trial_days: data.trial_days,
        is_custom: data.is_custom,
        active: data.active,
        features: features as any,
      };

      if (plan) {
        const { error } = await supabase
          .from("plans")
          .update(planData)
          .eq("id", plan.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("plans")
          .insert([planData]);
        
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      // Error saving plan
      toast({
        title: "Erro",
        description: "Erro ao salvar plano. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan ? "Editar Plano" : "Novo Plano"}
          </DialogTitle>
          <DialogDescription>
            {plan ? "Edite as informações do plano" : "Preencha as informações do novo plano"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Plano</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Plano Básico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do plano..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="user_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Usuários (-1 = ilimitado)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trial_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias de Teste Grátis</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="is_custom"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Plano sob orçamento</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Ativo</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel>Funcionalidades</FormLabel>
              
              <div className="grid grid-cols-2 gap-2">
                {defaultFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={features.includes(feature)}
                      onCheckedChange={() => toggleDefaultFeature(feature)}
                    />
                    <label htmlFor={feature} className="text-sm">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar funcionalidade personalizada..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature}>
                  Adicionar
                </Button>
              </div>

              {features.filter(f => !defaultFeatures.includes(f)).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Funcionalidades personalizadas:</p>
                  {features.filter(f => !defaultFeatures.includes(f)).map((feature) => (
                    <div key={feature} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(feature)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {plan ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}