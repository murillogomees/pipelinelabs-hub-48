import * as z from 'zod';

export const configFieldSchema = z.object({
  field: z.string().min(1, 'Campo é obrigatório'),
  type: z.enum(['text', 'password', 'email', 'url', 'number', 'boolean']),
  label: z.string().min(1, 'Label é obrigatório'),
  required: z.boolean(),
  placeholder: z.string().optional(),
  description: z.string().optional()
});

export const integrationFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['logistica', 'financeiro', 'api', 'comunicacao', 'contabilidade', 'personalizada']),
  description: z.string().optional(),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  config_fields: z.array(configFieldSchema),
  available_for_plans: z.array(z.string()),
  visible_to_companies: z.boolean()
});

export type IntegrationFormData = z.infer<typeof integrationFormSchema>;