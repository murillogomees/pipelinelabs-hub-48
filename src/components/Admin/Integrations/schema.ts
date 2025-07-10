import * as z from 'zod';

export const integrationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  visible_to_companies: z.boolean(),
  config_fields: z.array(z.object({
    field: z.string().min(1, 'Campo é obrigatório'),
    type: z.string().min(1, 'Tipo é obrigatório'),
    label: z.string().min(1, 'Label é obrigatório'),
    required: z.boolean()
  }))
});

export type IntegrationFormData = z.infer<typeof integrationSchema>;