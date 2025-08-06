import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Save, Loader2 } from 'lucide-react';
import { CompanyData } from '@/hooks/useCompanyManagement';

const addressSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  zipcode: z.string().optional(),
  state_registration: z.string().optional(),
  municipal_registration: z.string().optional(),
  fiscal_email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type FormData = z.infer<typeof addressSchema>;

interface CompanyAddressFormProps {
  companyData: CompanyData;
  onSubmit: (data: Partial<CompanyData>) => void;
  isLoading: boolean;
  canEdit: boolean;
}

export function CompanyAddressForm({ companyData, onSubmit, isLoading, canEdit }: CompanyAddressFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: companyData.address || '',
      city: companyData.city || '',
      zipcode: companyData.zipcode || '',
      state_registration: companyData.state_registration || '',
      municipal_registration: companyData.municipal_registration || '',
      fiscal_email: companyData.fiscal_email || '',
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Endereço e Informações Fiscais
        </CardTitle>
        <CardDescription>
          Dados de localização e registros fiscais da empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço Completo</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Rua, número, complemento, bairro" 
                      {...field} 
                      disabled={!canEdit}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome da cidade" 
                        {...field} 
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zipcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="00000-000" 
                        {...field} 
                        disabled={!canEdit}
                        maxLength={9}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state_registration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscrição Estadual</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="000.000.000.000" 
                        {...field} 
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="municipal_registration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscrição Municipal</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="000000000" 
                        {...field} 
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fiscal_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Fiscal</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="fiscal@empresa.com" 
                      {...field} 
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {canEdit && (
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}