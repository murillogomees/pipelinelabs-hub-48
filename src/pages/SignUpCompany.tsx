
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Crown, Star, Zap, Briefcase, Building2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const companySchema = z.object({
  name: z.string().min(1, "Nome da empresa é obrigatório"),
  document: z.string().min(11, "CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipcode: z.string().optional(),
  selectedPlan: z.string().min(1, "Selecione um plano"),
});

type CompanyForm = z.infer<typeof companySchema>;

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  user_limit: number;
  trial_days: number;
  features: any;
  active: boolean;
}

const planIcons = {
  "Plano Básico": Zap,
  "Plano Econômico": Briefcase,
  "Plano Completo": Star,
  "Plano Exclusivo": Crown,
};

export function SignUpCompany() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      document: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipcode: "",
      selectedPlan: "",
    },
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("active", true)
        .order("price");
      
      if (error) throw error;
      return (data || []).map((plan: any) => ({
        ...plan,
        features: plan.features || []
      })) as Plan[];
    },
  });

  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    
    if (numbers.length <= 11) {
      // CPF
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      // CNPJ
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
  };

  const validateDocument = (document: string): boolean => {
    const numbers = document.replace(/\D/g, "");
    
    if (numbers.length === 11) {
      // Validação básica de CPF
      return true; // Aqui você pode implementar validação completa de CPF
    } else if (numbers.length === 14) {
      // Validação básica de CNPJ
      return true; // Aqui você pode implementar validação completa de CNPJ
    }
    
    return false;
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
    return <IconComponent className="h-6 w-6" />;
  };

  const onSubmit = async (data: CompanyForm) => {
    try {
      setIsSubmitting(true);
      
      const cleanDocument = data.document.replace(/\D/g, "");
      
      // Validar documento
      if (!validateDocument(data.document)) {
        toast({
          title: "Erro",
          description: "CPF ou CNPJ inválido",
          variant: "destructive",
        });
        return;
      }

      // Verificar se o documento já existe
      const { data: existingCompany, error: checkError } = await supabase
        .from("companies")
        .select("document")
        .eq("document", cleanDocument)
        .limit(1);

      if (checkError) {
        console.error("Erro ao verificar documento:", checkError);
        toast({
          title: "Erro",
          description: "Erro ao verificar documento",
          variant: "destructive",
        });
        return;
      }

      if (existingCompany && existingCompany.length > 0) {
        toast({
          title: "Documento já cadastrado",
          description: "Este CPF ou CNPJ já está cadastrado. Por favor, entre em contato com nosso suporte para continuar o processo.",
          variant: "destructive",
        });
        return;
      }

      // Criar a empresa
      const { data: newCompany, error: companyError } = await supabase
        .from("companies")
        .insert([{
          name: data.name,
          document: cleanDocument,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipcode: data.zipcode,
        }])
        .select()
        .single();

      if (companyError) {
        console.error("Erro ao criar empresa:", companyError);
        toast({
          title: "Erro",
          description: "Erro ao criar empresa",
          variant: "destructive",
        });
        return;
      }

      // Encontrar o plano selecionado
      const selectedPlan = plans?.find(p => p.id === data.selectedPlan);
      
      if (selectedPlan) {
        // Criar assinatura
        const subscriptionData: any = {
          company_id: newCompany.id,
          plan_id: selectedPlan.id,
          status: selectedPlan.trial_days > 0 ? "trial" : "active",
          price_paid: selectedPlan.price,
        };

        // Se tem período de teste, definir datas
        if (selectedPlan.trial_days > 0) {
          const now = new Date();
          const trialEnd = new Date(now.getTime() + (selectedPlan.trial_days * 24 * 60 * 60 * 1000));
          
          subscriptionData.trial_start_date = now.toISOString();
          subscriptionData.trial_end_date = trialEnd.toISOString();
        }

        const { error: subscriptionError } = await supabase
          .from("subscriptions")
          .insert([subscriptionData]);

        if (subscriptionError) {
          console.error("Erro ao criar assinatura:", subscriptionError);
          toast({
            title: "Aviso",
            description: "Empresa criada, mas houve erro ao criar assinatura",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Sucesso",
        description: "Empresa cadastrada com sucesso!",
      });

      // Redirecionar para login ou dashboard
      navigate("/");
      
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao cadastrar empresa",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Cadastre sua Empresa</h1>
            <p className="text-muted-foreground">Escolha um plano e comece a usar o Pipeline Labs</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-8">
            {/* Formulário */}
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>Preencha os dados da sua empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa *</FormLabel>
                      <FormControl>
                        <Input placeholder="Minha Empresa Ltda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF ou CNPJ *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="000.000.000-00 ou 00.000.000/0000-00"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatDocument(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contato@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="São Paulo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="SP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seleção de Planos */}
            <Card>
              <CardHeader>
                <CardTitle>Escolha seu Plano</CardTitle>
                <CardDescription>Selecione o plano ideal para sua empresa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="selectedPlan"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-4"
                          >
                            {plans?.map((plan) => (
                              <div key={plan.id} className="relative">
                                <RadioGroupItem
                                  value={plan.id}
                                  id={plan.id}
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor={plan.id}
                                  className="flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-muted/50 peer-checked:bg-primary/5 peer-checked:border-primary"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {getPlanIcon(plan.name)}
                                      <span className="font-semibold">{plan.name}</span>
                                    </div>
                                     <span className="font-bold text-primary">
                                       {formatPrice(plan.price, false)}
                                     </span>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {plan.description}
                                  </p>

                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Check className="h-3 w-3 text-green-600" />
                                      <span>
                                        {plan.user_limit === -1 
                                          ? "Usuários ilimitados" 
                                          : `${plan.user_limit} usuário${plan.user_limit > 1 ? 's' : ''}`
                                        }
                                      </span>
                                    </div>

                                    {plan.trial_days > 0 && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-3 w-3 text-green-600" />
                                        <span className="text-green-600 font-medium">
                                          {plan.trial_days} dias grátis
                                        </span>
                                      </div>
                                    )}

                                    {plan.features.slice(0, 2).map((feature, index) => (
                                      <div key={index} className="flex items-center gap-2 text-sm">
                                        <Check className="h-3 w-3 text-green-600" />
                                        <span>{feature}</span>
                                      </div>
                                    ))}
                                  </div>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit"
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Cadastrando..." : "Finalizar Cadastro"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </Form>
  );
}
