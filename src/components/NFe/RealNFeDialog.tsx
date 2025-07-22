import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, FileText, Package, Loader2 } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/components/Products/hooks/useProducts';
import { useNFeIntegration } from '@/hooks/useNFeIntegration';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const nfeSchema = z.object({
  type: z.enum(['nfe', 'nfse']),
  customer_id: z.string().optional(),
  customer_name: z.string().min(1, 'Nome é obrigatório'),
  customer_document: z.string().min(11, 'CPF/CNPJ é obrigatório'),
  customer_email: z.string().email().optional().or(z.literal('')),
  customer_address: z.string().optional(),
  customer_number: z.string().optional(),
  customer_neighborhood: z.string().optional(),
  customer_city: z.string().optional(),
  customer_state: z.string().optional(),
  customer_zipcode: z.string().optional(),
  nature_operation: z.string().min(1, 'Natureza da operação é obrigatória'),
  notes: z.string().optional(),
  items: z.array(z.object({
    code: z.string().min(1, 'Código é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    quantity: z.number().min(0.001, 'Quantidade deve ser maior que zero'),
    unit_value: z.number().min(0.01, 'Valor unitário deve ser maior que zero'),
    total_value: z.number(),
    unit_of_measurement: z.string().default('UN'),
    ncm_code: z.string().optional(),
    cfop: z.string().optional(),
    icms_tax_situation: z.string().default('00'),
    icms_tax_percentage: z.number().default(0),
    ipi_tax_situation: z.string().default('99'),
    ipi_tax_percentage: z.number().default(0),
    pis_tax_situation: z.string().default('99'),
    pis_tax_percentage: z.number().default(0),
    cofins_tax_situation: z.string().default('99'),
    cofins_tax_percentage: z.number().default(0),
  })).min(1, 'Adicione pelo menos um item'),
});

type RealNFeFormData = z.infer<typeof nfeSchema>;

interface RealNFeDialogProps {
  trigger: React.ReactNode;
}

export function RealNFeDialog({ trigger }: RealNFeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { customers } = useCustomers();
  const { data: products = [] } = useProducts();
  const { issueNFe, issueNFeProduct, isConfigured } = useNFeIntegration();
  const { toast } = useToast();

  const form = useForm<RealNFeFormData>({
    resolver: zodResolver(nfeSchema),
    defaultValues: {
      type: 'nfe',
      nature_operation: 'Venda de mercadoria',
      customer_name: '',
      customer_document: '',
      customer_email: '',
      items: [
        {
          code: '',
          description: '',
          quantity: 1,
          unit_value: 0,
          total_value: 0,
          unit_of_measurement: 'UN',
          cfop: '5102',
          icms_tax_situation: '00',
          icms_tax_percentage: 0,
          ipi_tax_situation: '99',
          ipi_tax_percentage: 0,
          pis_tax_situation: '99',
          pis_tax_percentage: 0,
          cofins_tax_situation: '99',
          cofins_tax_percentage: 0,
        },
      ],
    },
  });

  const watchedItems = form.watch('items');
  const watchedType = form.watch('type');

  const addItem = () => {
    const currentItems = form.getValues('items');
    form.setValue('items', [
      ...currentItems,
      {
        code: '',
        description: '',
        quantity: 1,
        unit_value: 0,
        total_value: 0,
        unit_of_measurement: 'UN',
        cfop: '5102',
        icms_tax_situation: '00',
        icms_tax_percentage: 0,
        ipi_tax_situation: '99',
        ipi_tax_percentage: 0,
        pis_tax_situation: '99',
        pis_tax_percentage: 0,
        cofins_tax_situation: '99',
        cofins_tax_percentage: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items');
    if (currentItems.length > 1) {
      form.setValue('items', currentItems.filter((_, i) => i !== index));
    }
  };

  const updateItemTotal = (index: number) => {
    const items = form.getValues('items');
    const item = items[index];
    const total = item.quantity * item.unit_value;
    form.setValue(`items.${index}.total_value`, total);
  };

  const fillCustomerData = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      form.setValue('customer_name', customer.name);
      form.setValue('customer_document', customer.document || '');
      form.setValue('customer_email', customer.email || '');
      form.setValue('customer_address', customer.address || '');
      form.setValue('customer_city', customer.city || '');
      form.setValue('customer_state', customer.state || '');
      form.setValue('customer_zipcode', customer.zipcode || '');
    }
  };

  const fillProductData = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.code`, product.code);
      form.setValue(`items.${index}.description`, product.name);
      form.setValue(`items.${index}.unit_value`, Number(product.price) || 0);
      form.setValue(`items.${index}.ncm_code`, product.ncm_code || '');
      updateItemTotal(index);
    }
  };

  const onSubmit = async (data: RealNFeFormData) => {
    if (!isConfigured) {
      toast({
        title: "NFe.io não configurada",
        description: "Configure a integração NFe.io nas configurações antes de emitir notas.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const nfeData = {
        customer: {
          name: data.customer_name,
          document: data.customer_document,
          email: data.customer_email,
          address: data.customer_address,
          number: data.customer_number,
          neighborhood: data.customer_neighborhood,
          city: data.customer_city,
          state: data.customer_state,
          zipcode: data.customer_zipcode,
        },
        items: data.items,
        total_amount: data.items.reduce((sum, item) => sum + item.total_value, 0),
        nature_operation: data.nature_operation,
        notes: data.notes,
      };

      let result;
      if (data.type === 'nfe') {
        // NFe de produto
        result = await issueNFeProduct(nfeData);
      } else {
        // NFSe de serviço
        result = await issueNFe(nfeData);
      }

      toast({
        title: "NFe emitida com sucesso!",
        description: `Número: ${result.number || result.id}`,
      });

      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error('Erro ao emitir NFe:', error);
      toast({
        title: "Erro ao emitir NFe",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConfigured) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>NFe.io não configurada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Para emitir notas fiscais reais, você precisa configurar a integração com NFe.io primeiro.
            </p>
            <Button onClick={() => setOpen(false)}>
              Ir para Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {watchedType === 'nfe' ? <Package className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            Nova {watchedType === 'nfe' ? 'NFe (Produto)' : 'NFSe (Serviço)'}
            <Badge variant="outline">NFe.io</Badge>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general">
              <TabsList>
                <TabsTrigger value="general">Dados Gerais</TabsTrigger>
                <TabsTrigger value="customer">Cliente</TabsTrigger>
                <TabsTrigger value="items">Itens</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Nota</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nfe">NFe - Produtos</SelectItem>
                            <SelectItem value="nfse">NFSe - Serviços</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nature_operation"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Natureza da Operação</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Venda de mercadoria" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Observações adicionais (opcional)" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="customer" className="space-y-4">
                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente Cadastrado (Opcional)</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        fillCustomerData(value);
                      }}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar cliente existente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome/Razão Social *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do cliente" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer_document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF/CNPJ *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="000.000.000-00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="cliente@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer_zipcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="00000-000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Rua, Avenida..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer_neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Centro" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="São Paulo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="SP" maxLength={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="items" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Itens da Nota</h3>
                  <Button type="button" onClick={addItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                {watchedItems.map((_, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {watchedItems.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <FormLabel>Produto Cadastrado (Opcional)</FormLabel>
                        <Select onValueChange={(value) => fillProductData(index, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar produto existente" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.code} - {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <FormField
                        control={form.control}
                        name={`items.${index}.code`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="SKU001" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Descrição do produto/serviço" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.unit_of_measurement`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidade</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="UN" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.ncm_code`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NCM</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="12345678" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.cfop`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CFOP</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="5102" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.001"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value) || 0);
                                  updateItemTotal(index);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.unit_value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Unitário *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value) || 0);
                                  updateItemTotal(index);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.total_value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                readOnly
                                className="bg-muted"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchedType === 'nfe' && (
                        <>
                          <FormField
                            control={form.control}
                            name={`items.${index}.icms_tax_situation`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Situação ICMS</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="00" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.icms_tax_percentage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ICMS (%)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}

                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-lg font-semibold">
                    Total da Nota: R$ {watchedItems.reduce((sum, item) => sum + (item.total_value || 0), 0).toFixed(2)}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Emitindo...
                  </>
                ) : (
                  `Emitir ${watchedType === 'nfe' ? 'NFe' : 'NFSe'}`
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}