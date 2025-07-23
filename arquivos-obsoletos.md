# 📁 Arquivos Obsoletos - Pipeline Labs

## 🗑️ Arquivos para Remoção

### 🧪 Componentes de Demo/Teste
- **`src/components/Demo/RateLimitDemo.tsx`**
  - **Por quê:** Componente de demonstração que não é usado em produção
  - **Uso:** Apenas para testes de rate limiting de edge functions
  - **Impacto:** Nenhum - não está importado em nenhum lugar

### 🔒 Componentes de Autenticação Redundantes
- **`src/components/Auth/hooks/useRateLimit.ts`** ✅ **JÁ REMOVIDO**
  - **Por quê:** Funcionalidade duplicada e consolidada no `useAuthForm`
  - **Motivo:** Rate limiting implementado diretamente no hook principal

### 📊 Hooks com Funcionalidade Duplicada
- **`src/hooks/useOptimizedQueries.ts`** (funções específicas)
  - **`useGlobalSearch` (linha 175)** - Duplicata da função em `src/hooks/useGlobalSearch.ts`
  - **Por quê:** Mesma funcionalidade implementada em dois lugares diferentes

### 🎨 Assets de Mockup Antigos
- **`src/assets/dashboard-mockup.jpg`**
- **`src/assets/financial-mockup.jpg`**
- **`src/assets/inventory-mockup.jpg`**
- **`src/assets/invoice-mockup.jpg`**
- **`src/assets/frustrated-business-owner.jpg`**
- **`src/assets/success-team.jpg`**
  - **Por quê:** Imagens de demonstração que não são usadas na versão atual
  - **Uso atual:** Apenas na landing page inicial, podem ser substituídas por imagens real do sistema

### 📄 Arquivos de Configuração Mortos
- **`src/components/Security/index.ts`**
  - **Por quê:** Export de componentes Security que não são utilizados
  - **Componentes exportados:** SecureForm, SecureInput, SecureTextarea não tem uso real

## ⚠️ Verificar Antes de Remover

### 🔍 Componentes Possivelmente Obsoletos
- **`src/components/Security/SecureForm.tsx`**
- **`src/components/Security/SecureInput.tsx`**
- **`src/components/Security/SecureTextarea.tsx`**
  - **Status:** Implementados mas não utilizados
  - **Investigar:** Se há planos de implementar validação de segurança avançada

### 📝 TODOs que Podem Indicar Código Morto
- **`src/hooks/useMarketplaceIntegrations.ts`** (linhas 119, 129)
  - Funções `testConnection` e `syncNow` com implementação mockada
  - **Ação:** Implementar funcionalidade real ou remover se não necessário

## 📦 Dependências Potencialmente Não Utilizadas

### 🎨 Componentes UI Não Referenciados
- **`@/components/ui/aspect-ratio.tsx`** - Verificar uso
- **`@/components/ui/carousel.tsx`** - Verificar uso
- **`@/components/ui/collapsible.tsx`** - Verificar uso
- **`@/components/ui/context-menu.tsx`** - Verificar uso
- **`@/components/ui/hover-card.tsx`** - Verificar uso
- **`@/components/ui/menubar.tsx`** - Verificar uso
- **`@/components/ui/navigation-menu.tsx`** - Verificar uso
- **`@/components/ui/password-validator.tsx`** - Verificar uso real
- **`@/components/ui/resizable.tsx`** - Verificar uso
- **`@/components/ui/slider.tsx`** - Verificar uso
- **`@/components/ui/toggle-group.tsx`** - Verificar uso
- **`@/components/ui/toggle.tsx`** - Verificar uso

## 🧹 Comentários e Código Morto

### 💬 Comentários Desnecessários Removidos
- ✅ `{/* TODO: Implementar dialog para criar/editar plano */}` - Removido
- ✅ `{/* Removed unused tabs */}` - Removido de todas as páginas
- ✅ `// TODO: Enviar para Sentry, LogRocket, etc.` - Atualizado

### 🗂️ Imports Não Utilizados
- **`src/pages/Compras.tsx`** 
  - `import { supabase }` - Removido, pois `useUserCompany` substitui a query direta

## 📊 Relatório de Limpeza

**Total de arquivos identificados:** 15  
**Arquivos já removidos:** 1  
**Arquivos para verificação:** 4  
**Componentes UI para auditoria:** 11  
**Comentários mortos removidos:** 6  

## 🎯 Próximos Passos

1. **Confirmar remoção** dos componentes Demo e Security não utilizados
2. **Auditar componentes UI** para verificar uso real
3. **Implementar ou remover** funcionalidades mockadas em marketplace integrations
4. **Substituir assets** de mockup por screenshots reais do sistema
5. **Revisar dependências** do package.json para identificar bibliotecas não utilizadas