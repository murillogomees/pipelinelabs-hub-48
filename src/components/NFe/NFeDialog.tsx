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
import { Plus, Trash2 } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/components/Products/hooks/useProducts';
import { useNFe, CreateNFeData } from '@/hooks/useNFe';
import { TermsProtectedAction } from '@/components/Terms';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const nfeSchema = z.object({
  customer_id: z.string().optional(),
  issue_date: z.string().min(1, 'Data de emissão é obrigatória'),
  series: z.string().default('001'),
  items: z.array(z.object({
    product_id: z.string().optional(),
    item_code: z.string().min(1, 'Código é obrigatório'),
    item_description: z.string().min(1, 'Descrição é obrigatória'),
    ncm_code: z.string().optional(),
    quantity: z.number().min(0.001, 'Quantidade deve ser maior que zero'),
    unit_value: z.number().min(0.01, 'Valor unitário deve ser maior que zero'),
    total_value: z.number(),
    icms_percentage: z.number().default(0),
    pis_percentage: z.number().default(0),
    cofins_percentage: z.number().default(0),
    ipi_percentage: z.number().default(0),
  })).min(1, 'Adicione pelo menos um item'),
});

type NFeFormData = z.infer<typeof nfeSchema>;

interface NFeDialogProps {
  trigger: React.ReactNode;
}

export function NFeDialog({ trigger }: NFeDialogProps) {
  const [open, setOpen] = useState(false);
  const { customers } = useCustomers();
  const { data: products = [] } = useProducts();
  const { createNFe } = useNFe();

  const form = useForm<NFeFormData>({
    resolver: zodResolver(nfeSchema),
    defaultValues: {
      issue_date: new Date().toISOString().split('T')[0],
      series: '001',
      items: [
        {
          item_code: '',
          item_description: '',
          quantity: 1,
          unit_value: 0,
          total_value: 0,
          icms_percentage: 0,
          pis_percentage: 0,
          cofins_percentage: 0,
          ipi_percentage: 0,
        },
      ],
    },
  });

  const watchedItems = form.watch('items');

  const addItem = () => {
    const currentItems = form.getValues('items');
    form.setValue('items', [
      ...currentItems,
      {
        item_code: '',
        item_description: '',
        quantity: 1,
        unit_value: 0,
        total_value: 0,
        icms_percentage: 0,
        pis_percentage: 0,
        cofins_percentage: 0,
        ipi_percentage: 0,
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

  const onSubmit = async (data: NFeFormData) => {
    try {
      await createNFe.mutateAsync(data as CreateNFeData);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao criar NFe:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova NFe</DialogTitle>
        </DialogHeader>

        <TermsProtectedAction action="emitir notas fiscais">
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar cliente" />
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

              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Emissão</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="series"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Série</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Itens da NFe</h3>
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.item_code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="SKU001" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.item_description`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Descrição do produto" />
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
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
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
                          <FormLabel>Valor Unitário</FormLabel>
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

                    <FormField
                      control={form.control}
                      name={`items.${index}.icms_percentage`}
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
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createNFe.isPending}>
                {createNFe.isPending ? 'Criando...' : 'Criar NFe'}
              </Button>
            </div>
          </form>
        </Form>
        </TermsProtectedAction>
      </DialogContent>
    </Dialog>
  );
}