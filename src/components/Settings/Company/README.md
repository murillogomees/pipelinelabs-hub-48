# Sub-aba "Empresa Contratante" - Configurações

## ✅ Funcionalidades Implementadas

### 📊 Formulário Completo de Empresa Contratante

#### Campos Implementados:
- **Razão Social** - Campo obrigatório para dados corporativos
- **Nome Fantasia** - Nome comercial da empresa
- **CNPJ** - Validado e único no sistema
- **E-mail Principal** - Contato principal da empresa
- **E-mail Fiscal** - E-mail específico para questões fiscais
- **Telefone** - Formatação automática (11) 99999-9999
- **Responsável Legal** - Nome do responsável pela empresa
- **Endereço Completo** - Logradouro, número, bairro
- **Cidade** - Cidade onde empresa está localizada
- **CEP** - Formatação automática 00000-000
- **Inscrição Estadual** - Registro na Receita Estadual
- **Inscrição Municipal** - Registro na Prefeitura
- **Regime Tributário** - Simples Nacional, Lucro Real, Lucro Presumido

### 🔐 Sistema de Permissões

#### **Contratante (Owner da Empresa):**
- ✅ Pode visualizar todos os dados da própria empresa
- ✅ Pode editar todos os dados da própria empresa
- ❌ Não pode visualizar dados de outras empresas
- ✅ Pode ver histórico de alterações

#### **Super Administrador:**
- ✅ Pode visualizar dados de todas as empresas
- ✅ Pode editar dados de todas as empresas
- ✅ Acesso total ao sistema
- ✅ Pode ver logs de auditoria completos

#### **Operadores:**
- ✅ Modo "Somente Leitura" - podem visualizar mas não editar
- ❌ Não podem fazer alterações nos dados corporativos

### 🛡️ Validações e Segurança

#### **Validação de CNPJ:**
- ✅ Formatação automática (00.000.000/0000-00)
- ✅ Validação de 14 dígitos
- ✅ Rejeita sequências de números iguais
- ✅ Constraint de unicidade no banco
- ✅ Função `validate_cnpj()` no PostgreSQL

#### **Outras Validações:**
- ✅ E-mails com validação de formato
- ✅ Campos obrigatórios marcados
- ✅ Formatação automática para CEP e telefone
- ✅ Regime tributário com opções pré-definidas

### 📋 Histórico de Alterações (Audit Log)

#### **Funcionalidades:**
- ✅ Registro automático de todas as alterações
- ✅ Mostra quem fez a alteração e quando
- ✅ Exibe o que foi alterado (before/after)
- ✅ Apenas contratantes podem visualizar
- ✅ Integração com sistema de auditoria existente

#### **Informações Registradas:**
- Data/hora da alteração
- Usuário que fez a alteração
- Campos alterados (antes/depois)
- Status da operação (sucesso/erro)
- Severidade da alteração

### 🎨 Interface e UX

#### **Design Responsivo:**
- ✅ Layout adaptativo para mobile, tablet e desktop
- ✅ Seções organizadas (Básicas, Contato, Endereço, Inscrições)
- ✅ Badge "Somente Leitura" para usuários sem permissão
- ✅ Botões com estados de loading
- ✅ Formatação automática em tempo real

#### **Modo de Edição:**
- ✅ Modo visualização por padrão
- ✅ Botão "Editar" para contratantes
- ✅ Botões "Salvar" e "Cancelar" durante edição
- ✅ Campos desabilitados quando não está editando

### 🔧 Implementação Técnica

#### **Arquivos Criados:**
- `src/hooks/useCompanyData.ts` - Hook para gerenciar dados da empresa
- `src/components/Settings/Company/CompanyForm.tsx` - Formulário principal
- `src/components/Settings/Company/CompanyAuditLog.tsx` - Histórico de alterações
- Migração SQL para novos campos na tabela `companies`

#### **Integração:**
- ✅ Substituiu a EmpresaTab existente
- ✅ Mantém compatibilidade com sistema atual
- ✅ Usa políticas RLS existentes
- ✅ Integração com sistema de permissões atual

### 📊 Banco de Dados

#### **Novos Campos Adicionados:**
```sql
ALTER TABLE public.companies ADD COLUMN:
- legal_name (text) - Razão Social
- trade_name (text) - Nome Fantasia  
- state_registration (text) - Inscrição Estadual
- municipal_registration (text) - Inscrição Municipal
- tax_regime (text) - Regime Tributário
- legal_representative (text) - Responsável Legal
- fiscal_email (text) - E-mail Fiscal
```

#### **Constraints e Índices:**
- ✅ CNPJ único (`idx_companies_document_unique`)
- ✅ Validação de CNPJ (`check_valid_cnpj`)
- ✅ Função `validate_cnpj()` para validação
- ✅ Índice de busca por razão social

### 🚀 Como Usar

1. **Acesso:** Vá em Configurações > Empresa
2. **Visualização:** Todos os dados são exibidos em modo leitura
3. **Edição:** Clique em "Editar" (apenas para contratantes)
4. **Validação:** Preencha campos obrigatórios (marcados com *)
5. **Salvamento:** Clique em "Salvar Alterações"
6. **Histórico:** Visualize alterações na seção "Histórico de Alterações"

### ⚠️ Avisos de Segurança

- **CNPJ único:** O sistema impede cadastro de CNPJs duplicados
- **Permissões:** Operadores não podem alterar dados corporativos
- **Auditoria:** Todas as alterações são registradas
- **Validação:** Dados são validados no frontend e backend

### 🔄 Fluxo de Permissões

```
Usuário acessa Configurações > Empresa
      ↓
Sistema verifica tipo de usuário
      ↓
┌─ Contratante → Pode editar tudo
├─ Super Admin → Pode editar tudo  
└─ Operador → Somente leitura
      ↓
Exibe interface correspondente
      ↓
Registra alterações no audit log
```

## 🎯 Resultado Final

✅ **Sub-aba funcional** dentro de Configurações  
✅ **Formulário completo** com todos os campos necessários  
✅ **Sistema de permissões** robusto e seguro  
✅ **Validações** de CNPJ e outros campos  
✅ **Histórico de alterações** completo  
✅ **Interface responsiva** e profissional  
✅ **Integração perfeita** com sistema existente  

A funcionalidade está pronta para uso em produção! 🚀