import { z } from 'zod';

// Base validation helpers
const sanitizeString = (value: string) => value.trim();

const createStringSchema = (options: {
  min?: number;
  max?: number;
  pattern?: RegExp;
  required?: boolean;
} = {}) => {
  let schema = z.string();
  
  if (options.required !== false) {
    schema = schema.min(1, 'Campo obrigatório');
  }
  
  if (options.min) {
    schema = schema.min(options.min, `Mínimo ${options.min} caracteres`);
  }
  
  if (options.max) {
    schema = schema.max(options.max, `Máximo ${options.max} caracteres`);
  }
  
  if (options.pattern) {
    schema = schema.regex(options.pattern, 'Formato inválido');
  }
  
  return schema.transform(sanitizeString);
};

// Document validation (CPF/CNPJ)
const documentSchema = z.string()
  .min(11, 'Documento deve ter pelo menos 11 caracteres')
  .max(18, 'Documento deve ter no máximo 18 caracteres')
  .regex(/^[\d./-]+$/, 'Documento deve conter apenas números, pontos, traços e barras')
  .transform(val => val.replace(/[^0-9]/g, ''));

// Email validation
const emailSchema = z.string()
  .min(1, 'Email é obrigatório')
  .email('Email inválido')
  .max(254, 'Email muito longo')
  .transform(val => val.toLowerCase().trim());

// Password validation
const passwordSchema = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número');

// Phone validation
const phoneSchema = z.string()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(15, 'Telefone deve ter no máximo 15 dígitos')
  .regex(/^[\d\s\-\(\)\+]+$/, 'Telefone deve conter apenas números, espaços, traços, parênteses e sinal de mais')
  .transform(val => val.replace(/[^0-9]/g, ''));

// URL validation
const urlSchema = z.string()
  .url('URL inválida')
  .max(2048, 'URL muito longa')
  .refine(val => {
    try {
      const url = new URL(val);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  }, 'URL deve usar protocolo HTTP ou HTTPS');

// UUID validation
const uuidSchema = z.string()
  .uuid('UUID inválido');

// Date validation
const dateSchema = z.coerce.date()
  .refine(date => !isNaN(date.getTime()), 'Data inválida');

// Monetary value validation
const monetarySchema = z.coerce.number()
  .min(0, 'Valor deve ser positivo')
  .max(999999999.99, 'Valor muito alto')
  .transform(val => Math.round(val * 100) / 100); // Round to 2 decimal places

// Quantity validation
const quantitySchema = z.coerce.number()
  .int('Quantidade deve ser um número inteiro')
  .min(0, 'Quantidade deve ser positiva')
  .max(999999, 'Quantidade muito alta');

// Percentage validation
const percentageSchema = z.coerce.number()
  .min(0, 'Porcentagem deve ser positiva')
  .max(100, 'Porcentagem não pode exceder 100%');

// Rich text validation (for HTML content)
const richTextSchema = z.string()
  .max(50000, 'Conteúdo muito longo')
  .optional();

// File validation
const fileSchema = z.object({
  name: createStringSchema({ max: 255 }),
  size: z.number().max(10 * 1024 * 1024, 'Arquivo muito grande (máximo 10MB)'),
  type: z.string().refine(type => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return allowedTypes.includes(type);
  }, 'Tipo de arquivo não permitido')
});

// Address validation
const addressSchema = z.object({
  street: createStringSchema({ max: 255 }),
  number: createStringSchema({ max: 20, required: false }),
  complement: createStringSchema({ max: 100, required: false }),
  neighborhood: createStringSchema({ max: 100 }),
  city: createStringSchema({ max: 100 }),
  state: createStringSchema({ min: 2, max: 2, pattern: /^[A-Z]{2}$/ }),
  zipcode: z.string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido')
    .transform(val => val.replace(/[^0-9]/g, ''))
});

// User validation schemas
export const userSchemas = {
  signUp: z.object({
    firstName: createStringSchema({ min: 2, max: 50 }),
    email: emailSchema,
    password: passwordSchema,
    phone: phoneSchema,
    companyName: createStringSchema({ min: 2, max: 100 }),
    document: documentSchema
  }),
  
  signIn: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Senha é obrigatória')
  }),
  
  profile: z.object({
    firstName: createStringSchema({ min: 2, max: 50 }),
    lastName: createStringSchema({ min: 2, max: 50 }),
    email: emailSchema,
    phone: phoneSchema.optional(),
    bio: createStringSchema({ max: 500, required: false }),
    website: urlSchema.optional(),
    avatar: fileSchema.optional()
  }),
  
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: passwordSchema,
    confirmPassword: z.string()
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword']
  })
};

// Company validation schemas
export const companySchemas = {
  create: z.object({
    name: createStringSchema({ min: 2, max: 100 }),
    document: documentSchema,
    email: emailSchema,
    phone: phoneSchema,
    website: urlSchema.optional(),
    address: addressSchema.optional(),
    industry: createStringSchema({ max: 100, required: false }),
    description: createStringSchema({ max: 1000, required: false })
  }),
  
  update: z.object({
    id: uuidSchema,
    name: createStringSchema({ min: 2, max: 100 }),
    email: emailSchema,
    phone: phoneSchema,
    website: urlSchema.optional(),
    address: addressSchema.optional(),
    industry: createStringSchema({ max: 100, required: false }),
    description: createStringSchema({ max: 1000, required: false })
  })
};

// Product validation schemas
export const productSchemas = {
  create: z.object({
    name: createStringSchema({ min: 2, max: 255 }),
    description: createStringSchema({ max: 2000, required: false }),
    code: createStringSchema({ max: 50, required: false }),
    barcode: createStringSchema({ max: 50, required: false }),
    category: createStringSchema({ max: 100, required: false }),
    brand: createStringSchema({ max: 100, required: false }),
    unit: createStringSchema({ max: 20 }),
    price: monetarySchema,
    cost: monetarySchema.optional(),
    stock_quantity: quantitySchema,
    min_stock: quantitySchema.optional(),
    max_stock: quantitySchema.optional(),
    weight: z.coerce.number().min(0).optional(),
    dimensions: z.object({
      length: z.coerce.number().min(0).optional(),
      width: z.coerce.number().min(0).optional(),
      height: z.coerce.number().min(0).optional()
    }).optional(),
    tax_info: z.object({
      ncm: createStringSchema({ max: 10, required: false }),
      cfop: createStringSchema({ max: 10, required: false }),
      icms_rate: percentageSchema.optional(),
      ipi_rate: percentageSchema.optional()
    }).optional()
  }),
  
  update: z.object({
    id: uuidSchema,
    name: createStringSchema({ min: 2, max: 255 }),
    description: createStringSchema({ max: 2000, required: false }),
    code: createStringSchema({ max: 50, required: false }),
    barcode: createStringSchema({ max: 50, required: false }),
    category: createStringSchema({ max: 100, required: false }),
    brand: createStringSchema({ max: 100, required: false }),
    unit: createStringSchema({ max: 20 }),
    price: monetarySchema,
    cost: monetarySchema.optional(),
    stock_quantity: quantitySchema,
    min_stock: quantitySchema.optional(),
    max_stock: quantitySchema.optional(),
    weight: z.coerce.number().min(0).optional(),
    dimensions: z.object({
      length: z.coerce.number().min(0).optional(),
      width: z.coerce.number().min(0).optional(),
      height: z.coerce.number().min(0).optional()
    }).optional(),
    tax_info: z.object({
      ncm: createStringSchema({ max: 10, required: false }),
      cfop: createStringSchema({ max: 10, required: false }),
      icms_rate: percentageSchema.optional(),
      ipi_rate: percentageSchema.optional()
    }).optional()
  })
};

// Customer validation schemas
export const customerSchemas = {
  create: z.object({
    name: createStringSchema({ min: 2, max: 100 }),
    document: documentSchema,
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    address: addressSchema.optional(),
    type: z.enum(['individual', 'company']),
    notes: createStringSchema({ max: 1000, required: false })
  }),
  
  update: z.object({
    id: uuidSchema,
    name: createStringSchema({ min: 2, max: 100 }),
    document: documentSchema,
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    address: addressSchema.optional(),
    type: z.enum(['individual', 'company']),
    notes: createStringSchema({ max: 1000, required: false })
  })
};

// Sale validation schemas
export const saleSchemas = {
  create: z.object({
    customer_id: uuidSchema,
    items: z.array(z.object({
      product_id: uuidSchema,
      quantity: quantitySchema,
      unit_price: monetarySchema,
      discount: monetarySchema.optional().default(0)
    })).min(1, 'Pelo menos um item é obrigatório'),
    discount: monetarySchema.optional().default(0),
    shipping_cost: monetarySchema.optional().default(0),
    payment_method: z.enum(['cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer']),
    notes: createStringSchema({ max: 1000, required: false })
  })
};

// Invoice validation schemas
export const invoiceSchemas = {
  create: z.object({
    customer_id: uuidSchema,
    items: z.array(z.object({
      description: createStringSchema({ max: 255 }),
      quantity: quantitySchema,
      unit_price: monetarySchema,
      total_price: monetarySchema
    })).min(1, 'Pelo menos um item é obrigatório'),
    invoice_type: z.enum(['NFE', 'NFSE', 'NFCE']),
    notes: createStringSchema({ max: 1000, required: false })
  })
};

// Contact form validation
export const contactSchema = z.object({
  name: createStringSchema({ min: 2, max: 100 }),
  email: emailSchema,
  subject: createStringSchema({ min: 5, max: 200 }),
  message: createStringSchema({ min: 10, max: 2000 }),
  company: createStringSchema({ max: 100, required: false }),
  phone: phoneSchema.optional()
});

// Comment validation
export const commentSchema = z.object({
  content: createStringSchema({ min: 1, max: 2000 }),
  parent_id: uuidSchema.optional()
});

// Export all schemas
export const validationSchemas = {
  user: userSchemas,
  company: companySchemas,
  product: productSchemas,
  customer: customerSchemas,
  sale: saleSchemas,
  invoice: invoiceSchemas,
  contact: contactSchema,
  comment: commentSchema
};

// Common validation utilities
export const validationUtils = {
  sanitizeString,
  createStringSchema,
  documentSchema,
  emailSchema,
  passwordSchema,
  phoneSchema,
  urlSchema,
  uuidSchema,
  dateSchema,
  monetarySchema,
  quantitySchema,
  percentageSchema,
  richTextSchema,
  fileSchema,
  addressSchema
};