# 👻 Campos Fantasma - Pipeline Labs

## 🔍 Campos Definidos mas Não Utilizados

### 📊 Interfaces com Campos Não Implementados

#### **`src/components/Products/types.ts`**
```typescript
// 🚨 Constantes definidas mas sem uso em formulários
export const PRODUCT_CONDITIONS = {
  NOVO: 'novo',
  USADO: 'usado', 
  RECONDICIONADO: 'recondicionado'  // 👻 Não usado em ProductBasicForm
} as const;

export const PRODUCTION_TYPES = {
  PROPRIA: 'propria',
  TERCEIRO: 'terceiro'  // 👻 Não usado em ProductBasicForm
} as const;

export const UNIT_MEASURES = {
  CM: 'cm',
  M: 'm', 
  MM: 'mm'  // 👻 Definido mas ProductStockForm não usa
} as const;
```

#### **`src/components/Admin/UserForm/types.ts`**
```typescript
export interface UserFormData {
  id?: string;
  email: string;
  displayName: string;
  companyId: string;
  userType: string;
  isActive: boolean;
  permissions: Record<string, boolean>;
  specificPermissions: Record<string, boolean>;
  
  // 👻 Campos fantasma - definidos mas não tem inputs correspondentes:
  phoneNumber?: string;    // Não há input de telefone no formulário
  department?: string;     // Não há campo departamento
  lastLoginAt?: string;    // Campo read-only que não deveria estar no form
  createdAt?: string;      // Campo read-only que não deveria estar no form
  updatedAt?: string;      // Campo read-only que não deveria estar no form
}
```

#### **`src/components/Admin/Integrations/types.ts`**
```typescript
export interface CompanyIntegration {
  id: string;
  company_id: string;
  integration_id: string;
  status: string;
  config: Record<string, any>;
  credentials: Record<string, any>;
  created_at: string;
  updated_at: string;
  
  // 👻 Campos fantasma:
  last_tested?: string;        // Definido mas não há funcionalidade de teste real
  test_results?: any;          // Definido mas useMarketplaceIntegrations tem TODO
  sync_frequency?: number;     // Definido mas não há UI para configurar
  webhook_url?: string;        // Campo existe mas não é usado no IntegrationDialog
}
```

### 🎛️ Campos de Formulário Órfãos

#### **`src/components/Contracts/ContractDialog.tsx`**
```typescript
// 👻 Campos no schema mas sem implementação visual:
const contractSchema = z.object({
  // ... campos implementados ...
  
  // Campos fantasma (definidos mas não renderizados):
  termination_clause: z.string().optional(),    // Sem textarea correspondente
  document_url: z.string().optional(),          // Sem input de URL ou upload
  signature_date: z.string().optional(),        // Sem DatePicker para assinatura
});
```

#### **`src/components/Financial/AccountPayableDialog.tsx`**
```typescript
// 👻 Interface completa mas formulário simplificado:
interface AccountPayableFormData {
  supplier_id: string;
  description: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: string;
  notes?: string;
  
  // Campos fantasma:
  category_id?: string;        // Sem Select de categorias
  cost_center_id?: string;     // Sem Select de centro de custo  
  payment_method?: string;     // Sem Select de método de pagamento
  attachment_url?: string;     // Sem funcionalidade de anexo
}
```

### 🗄️ Campos de Database Órfãos

#### **Tabela `products` (Supabase)**
```sql
-- 👻 Campos existentes no banco mas não utilizados no ProductDialog:
CREATE TABLE products (
  -- Campos utilizados... 
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  
  -- Campos fantasma:
  height NUMERIC,              -- Não há input para altura
  width NUMERIC,               -- Não há input para largura  
  length NUMERIC,              -- Não há input para comprimento
  weight NUMERIC,              -- Não há input para peso
  condition TEXT,              -- PRODUCT_CONDITIONS não usado
  production_type TEXT,        -- PRODUCTION_TYPES não usado
  warranty_months INTEGER,     -- Não há campo garantia
  brand TEXT,                  -- Não há campo marca
  model TEXT,                  -- Não há campo modelo
  color TEXT,                  -- Não há campo cor
  material TEXT,               -- Não há campo material
  origin_country TEXT,         -- Não há campo país de origem
  hsn_code TEXT,              -- Não há campo código HSN
  batch_control BOOLEAN,       -- Não há toggle para controle de lote
  serial_control BOOLEAN,      -- Não há toggle para controle de série
  expiry_control BOOLEAN       -- Não há toggle para controle de validade
);
```

#### **Tabela `purchase_orders` (Supabase)**
```sql
-- 👻 Campos do banco não utilizados no PurchaseOrderDialog:
CREATE TABLE purchase_orders (
  -- Campos utilizados...
  order_number TEXT NOT NULL,
  supplier_id UUID,
  
  -- Campos fantasma:
  priority TEXT,               -- Não há Select de prioridade
  department_id UUID,          -- Não há Select de departamento
  project_id UUID,             -- Não há Select de projeto
  payment_terms TEXT,          -- Não há campo termos de pagamento
  delivery_address TEXT,       -- Não há campo endereço de entrega
  contact_person TEXT,         -- Não há campo pessoa de contato
  approval_status TEXT,        -- Não há workflow de aprovação
  approved_by UUID,            -- Não há campo aprovador
  approved_at TIMESTAMP,       -- Não há timestamp de aprovação
  currency TEXT,               -- Não há Select de moeda
  exchange_rate NUMERIC        -- Não há campo taxa de câmbio
);
```

### 🎭 Campos Mock/Placeholder

#### **`src/hooks/useMarketplaceIntegrations.ts`**
```typescript
// 👻 Implementações mockadas que fingem funcionar:
const testConnection = useMutation({
  mutationFn: async (id: string) => {
    // TODO: Implementar teste real  
    await new Promise(resolve => setTimeout(resolve, 2000));  // 👻 Fake delay
    return { success: true };  // 👻 Sempre retorna sucesso
  },
  onSuccess: () => toast(TOAST_MESSAGES.tested),
  onError: () => toast({ ...TOAST_MESSAGES.error, description: 'Falha na conexão' })
});

const syncNow = useMutation({
  mutationFn: async (id: string) => {
    // TODO: Implementar sincronização real
    await new Promise(resolve => setTimeout(resolve, 3000));  // 👻 Fake delay
    
    // 👻 Fake update - apenas altera timestamp
    await (supabase as any)
      .from('marketplace_integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', id);
    
    return { success: true };  // 👻 Sempre retorna sucesso
  },
});
```

#### **`src/components/Configuracoes/SistemaTab.tsx`**
```typescript
const getPlanoInfo = () => {
  if (!subscription) return null;
  
  return {
    planoAtual: subscription.plans?.name || 'Plano não identificado',
    usuariosPermitidos: subscription.plans?.user_limit || 1,
    usuariosAtivos: 1  // 👻 TODO: Implementar contagem real de usuários ativos
  };
};
```

## 🔧 Hooks com Parâmetros Não Utilizados

### 📊 Parâmetros Opcionais Ignorados

#### **`src/hooks/useSales.ts`**
```typescript
export function useSales(options?: {
  customerId?: string;     // 👻 Parâmetro aceito mas não filtrado nas queries
  dateRange?: {            // 👻 Parâmetro aceito mas não implementado
    start: string;
    end: string;
  };
  status?: string;         // 👻 Parâmetro aceito mas não filtrado
}) {
  // ... implementação ignora os options
}
```

#### **`src/hooks/useCustomers.ts`**
```typescript
// 👻 Hook aceita filtros mas não os implementa:
export function useCustomers(filters?: {
  search?: string;
  customerType?: string;  // 👻 Não usado na query
  status?: boolean;       // 👻 Não usado na query  
  city?: string;          // 👻 Não usado na query
}) {
  // Query ignora todos os filtros exceto search
}
```

## 🎨 CSS Classes Fantasma

### 🎭 Classes Definidas mas Não Aplicadas

#### **`src/index.css`**
```css
/* 👻 Classes definidas mas não utilizadas: */
.gradient-success {
  background: linear-gradient(135deg, hsl(var(--success)), hsl(var(--success-light)));
}

.gradient-warning {  
  background: linear-gradient(135deg, hsl(var(--warning)), hsl(var(--warning-light)));
}

.gradient-error {
  background: linear-gradient(135deg, hsl(var(--destructive)), hsl(var(--destructive-light)));
}

/* Classes de animação não utilizadas: */
.slide-in-left {
  animation: slideInLeft 0.3s ease-out;
}

.slide-in-right {
  animation: slideInRight 0.3s ease-out;
}
```

## 📊 Validations Schemas Fantasma

### 🔍 Validações Não Aplicadas

#### **`src/components/Purchases/schema.ts`**
```typescript
// 👻 Schema completo mas formulário não valida todos os campos:
export const purchaseOrderFormSchema = z.object({
  supplier_id: z.string().min(1, "Fornecedor é obrigatório"),
  supplier_name: z.string().min(1, "Nome do fornecedor é obrigatório"), 
  order_date: z.string().min(1, "Data do pedido é obrigatória"),
  delivery_date: z.string().optional(),  // 👻 Campo opcional mas não tem input
  status: z.enum(['draft', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled']),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),  // 👻 Campo opcional mas não tem textarea
  // ... outros campos
});
```

## 📈 Relatório de Campos Fantasma

### 📊 Estatísticas por Categoria

| Categoria | Campos Identificados | Impacto |
|-----------|---------------------|---------|
| **Interfaces não implementadas** | 15+ | 🔶 Médio |
| **Campos de banco órfãos** | 25+ | 🔴 Alto |
| **Parâmetros ignorados** | 8+ | 🟡 Baixo |
| **Implementações mock** | 5+ | 🔴 Alto |
| **CSS não utilizado** | 10+ | 🟡 Baixo |
| **Validações não aplicadas** | 6+ | 🔶 Médio |

### 🎯 Prioridades de Limpeza

#### 🔥 Alta Prioridade
1. **Implementações mock** - Implementar funcionalidade real ou remover
2. **Campos de banco órfãos** - Remover colunas não utilizadas
3. **Interfaces incompletas** - Implementar campos ou remover das interfaces

#### 📊 Média Prioridade
1. **Parâmetros de hook ignorados** - Implementar filtros ou remover parâmetros
2. **Validações não aplicadas** - Aplicar validações ou simplificar schemas
3. **Constants não utilizadas** - Implementar uso ou remover definições

#### 📝 Baixa Prioridade
1. **CSS não utilizado** - Remover classes órfãs
2. **Campos read-only em forms** - Mover para interfaces separadas
3. **TODOs em contadores** - Implementar contagem real

## ✅ Checklist de Limpeza

### 🗄️ Database
- [ ] Remover colunas não utilizadas de `products`
- [ ] Remover colunas não utilizadas de `purchase_orders`
- [ ] Auditar outras tabelas para campos órfãos

### 🎭 Interfaces
- [ ] Implementar campos faltantes em `ProductBasicForm`
- [ ] Limpar campos read-only de `UserFormData`
- [ ] Implementar ou remover campos de `ContractDialog`

### 🔧 Hooks
- [ ] Implementar filtros em `useSales` ou remover parâmetros
- [ ] Implementar filtros em `useCustomers` ou simplificar
- [ ] Implementar funcionalidade real em `useMarketplaceIntegrations`

### 🎨 UI/Styling
- [ ] Remover classes CSS não utilizadas
- [ ] Implementar uso de constants ou removê-las
- [ ] Aplicar validações de schema ou simplificar

### 📝 Code Quality
- [ ] Substituir TODOs por implementação real
- [ ] Remover campos mock de interfaces
- [ ] Documentar campos intencionalmente não utilizados