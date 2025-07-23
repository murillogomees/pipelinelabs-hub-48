# 🔄 Refatorar para Padrão - Pipeline Labs

## 📁 Estrutura de Pastas a Reorganizar

### 🎯 Componentes com Estrutura Inconsistente

#### **`src/components/Auth/`**
- ✅ **Bem estruturado** - Segue padrão com components/, hooks/ e arquivo principal
- **Mantém como está**

#### **`src/components/Admin/`**
- ✅ **Bem estruturado** - Subdivisões lógicas (UserForm/, Integrations/, etc.)
- **Mantém como está**

#### **`src/components/Purchases/`** 
- ✅ **Recém padronizado** - types.ts, schema.ts, componente principal
- **Mantém como está**

### 🔧 Componentes que Precisam de Reestruturação

#### **`src/components/Financial/`**
- **Problema:** Mistura hooks, componentes e utilidades no mesmo nível
- **Padrão esperado:**
  ```
  Financial/
  ├── components/
  │   ├── AccountPayableDialog.tsx
  │   ├── AccountReceivableDialog.tsx
  │   ├── BankAccountsTab.tsx
  │   ├── CashFlowReport.tsx
  │   └── DREReport.tsx
  ├── hooks/
  │   └── useFinancialAccounts.ts
  ├── constants.ts
  ├── utils.ts
  └── index.ts
  ```

#### **`src/components/Products/`**
- **Problema:** forms/ existe mas hooks/ no mesmo nível
- **Padrão esperado:**
  ```
  Products/
  ├── components/
  │   └── ProductDialog.tsx
  ├── forms/
  │   ├── ProductBasicForm.tsx
  │   ├── ProductPriceForm.tsx
  │   ├── ProductStockForm.tsx
  │   └── ProductTaxForm.tsx
  ├── hooks/
  │   └── useProducts.ts
  ├── types.ts
  ├── schema.ts
  └── index.ts
  ```

## 🏷️ Nomenclatura a Padronizar

### 📝 Arquivos com Nomes Inconsistentes

#### **Páginas (src/pages/)**
- ✅ **AdminX.tsx** - Padrão consistente para páginas admin
- ✅ **XxxYyy.tsx** - PascalCase correto para componentes React

#### **Hooks (src/hooks/)**
- ✅ **useXxxYyy.ts** - Padrão consistente
- **⚠️ Verificar:** `useLGPDRequestsSimple.ts` vs `usePrivacyConsentSimple.ts`
  - **Padronizar para:** `useLGPDRequests.ts` e `usePrivacyConsent.ts`

#### **Componentes UI (src/components/ui/)**
- ✅ **kebab-case.tsx** - Padrão consistente do shadcn/ui

### 🔤 Variáveis e Funções com Nomes Inconsistentes

#### **Constants (src/components/Configuracoes/constants.ts)**
```typescript
// ❌ Atual: Mistura de padrões
export const FINANCIAL_DEFAULTS = {
  moeda: 'BRL', // snake_case
  timezone: 'America/Sao_Paulo' // camelCase
}

// ✅ Padronizar para camelCase
export const FINANCIAL_DEFAULTS = {
  currency: 'BRL',
  timezone: 'America/Sao_Paulo'
}
```

## 🔄 Imports e Exports a Padronizar

### 📦 Imports Relativos Inconsistentes

#### **Problema 1: Imports ../types vs @/types**
```typescript
// ❌ Inconsistente
import { MenuItem } from '../types';
import { useToast } from '@/hooks/use-toast';

// ✅ Padronizar
import { MenuItem } from '@/components/Layout/Sidebar/types';
import { useToast } from '@/hooks/use-toast';
```

#### **Problema 2: Barrel Exports Incompletos**
- **`src/components/Financial/index.ts`** - Não existe
- **`src/components/Products/index.ts`** - Não existe
- **`src/components/Purchases/index.ts`** - Não existe

**Criar barrel exports:**
```typescript
// src/components/Products/index.ts
export { ProductDialog } from './components/ProductDialog';
export { useProducts } from './hooks/useProducts';
export * from './types';
export * from './schema';
```

## 🎨 Estilos e Classes CSS a Padronizar

### 🎯 Classes Tailwind Inconsistentes

#### **Problema: Cores hardcoded vs Design System**
```typescript
// ❌ Encontrado no código
className="border-green-200 text-green-500"
className="border-red-200 text-red-500"

// ✅ Usar design system
className="border-success text-success"
className="border-destructive text-destructive"
```

#### **Problema: Spacing inconsistente**
```typescript
// ❌ Mistura de padrões
className="space-y-4 gap-2 mb-6"

// ✅ Padronizar
className="space-y-4" // Para spacing vertical
className="gap-4"     // Para flex/grid gaps
```

## 🔧 Estrutura de Dados a Padronizar

### 📊 Interfaces com Padrões Diferentes

#### **Problema 1: Campos de Timestamp**
```typescript
// ❌ Inconsistente
interface PurchaseOrder {
  created_at: string;    // snake_case
  updated_at: string;    // snake_case
}

interface UserFormData {
  createdAt: string;     // camelCase
  updatedAt: string;     // camelCase
}

// ✅ Seguir padrão Supabase (snake_case para DB, camelCase para forms)
```

#### **Problema 2: Status/State Enums**
```typescript
// ❌ Inconsistente
status: 'draft' | 'sent' | 'confirmed'     // lowercase
status: 'ACTIVE' | 'INACTIVE'              // UPPERCASE
status: 'Pending' | 'Completed'            // PascalCase

// ✅ Padronizar para lowercase
status: 'draft' | 'sent' | 'confirmed'
```

## 🗂️ Organização de Arquivos por Funcionalidade

### 📋 Módulos que Precisam de Reorganização

#### **1. Security Components**
```
src/components/Security/
├── components/
│   ├── SecureForm.tsx
│   ├── SecureInput.tsx
│   └── SecureTextarea.tsx
├── hooks/
│   └── useSecurity.ts
└── index.ts
```

#### **2. LGPD Components**
```
src/components/LGPD/
├── components/
│   ├── PrivacyConsentBanner.tsx
│   └── UserDataManagement.tsx
├── providers/
│   └── PrivacyConsentProvider.tsx
├── hooks/
│   ├── usePrivacyConsent.ts      // renomear de usePrivacyConsentSimple
│   └── useLGPDRequests.ts        // renomear de useLGPDRequestsSimple
└── index.ts
```

## 🔄 Refatorações de Código

### 🎯 Padrões de Componente a Unificar

#### **Props Interface Naming**
```typescript
// ❌ Inconsistente
interface UserDialogProps
interface BaseDialogProps  
interface AuditLogDetailsProps

// ✅ Padronizar sufixo
interface UserDialogProps
interface BaseDialogProps
interface AuditLogDetailsProps
```

#### **Hook Return Objects**
```typescript
// ❌ Inconsistente  
return { data, loading, error }           // alguns hooks
return { users, isLoading, error }        // outros hooks

// ✅ Padronizar
return { data, isLoading, error }
```

## 📊 Relatório de Refatoração

**Módulos para reestruturar:** 4  
**Arquivos para renomear:** 3  
**Barrel exports para criar:** 3  
**Padrões de import para corrigir:** 15+  
**Classes CSS para padronizar:** 20+  

## 🎯 Prioridades de Refatoração

### 🔥 Alta Prioridade
1. **Estrutura Financial/** - Reorganizar em subpastas
2. **Estrutura Products/** - Mover hooks para subpasta
3. **Criar barrel exports** - Para todos os módulos principais
4. **Padronizar imports relativos** - Usar imports absolutos

### 📊 Média Prioridade  
1. **Renomear hooks LGPD** - Remover sufixo "Simple"
2. **Padronizar status enums** - Usar lowercase consistente
3. **Organizar Security components** - Reestruturar se mantidos

### 📝 Baixa Prioridade
1. **Padronizar classes CSS** - Migrar para design system
2. **Unificar naming conventions** - Props e return objects
3. **Organizar constants** - Usar camelCase consistente

## ✅ Checklist de Implementação

- [ ] Reestruturar `src/components/Financial/`
- [ ] Reestruturar `src/components/Products/`  
- [ ] Criar barrel exports para módulos principais
- [ ] Renomear hooks LGPD para remover "Simple"
- [ ] Padronizar imports relativos para absolutos
- [ ] Unificar padrões de status/state enums
- [ ] Revisar e padronizar classes CSS hardcoded
- [ ] Implementar naming conventions consistentes