# 🧹 Ferramentas de Limpeza de Código Morto

Este diretório contém scripts e ferramentas para detectar e remover código morto (dead code) do projeto Pipeline Labs.

## 🔧 Ferramentas Instaladas

### 1. **ts-prune**
Detecta exports TypeScript não utilizados em todo o projeto.

```bash
npx ts-prune
```

### 2. **depcheck** 
Analisa dependências npm não utilizadas no package.json.

```bash
npx depcheck
```

### 3. **eslint-plugin-unused-imports**
Plugin ESLint que detecta e remove automaticamente imports não utilizados.

```bash
npx eslint src --ext .ts,.tsx --rule "unused-imports/no-unused-imports: error"
```

## 📜 Scripts Disponíveis

### Análise Completa
```bash
node scripts/analyze-dead-code.js
```
Executa uma análise completa com todas as ferramentas e gera um relatório detalhado.

### Limpeza Automática
```bash
node scripts/clean-dead-code.js
```
Remove automaticamente imports não utilizados e fornece sugestões para outras limpezas.

## 🎯 Comandos Individuais

### Detectar exports não utilizados
```bash
npx ts-prune
```

### Detectar dependências não utilizadas
```bash
npx depcheck
```

### Detectar imports não utilizados
```bash
npx eslint src --ext .ts,.tsx --rule "unused-imports/no-unused-imports: error"
```

### Remover imports automaticamente
```bash
npx eslint src --ext .ts,.tsx --fix --rule "unused-imports/no-unused-imports: error"
```

### Executar ESLint normal com limpeza
```bash
npx eslint . --fix
```

## 📊 Exemplo de Uso Completo

```bash
# 1. Análise inicial
node scripts/analyze-dead-code.js

# 2. Limpeza automática
node scripts/clean-dead-code.js

# 3. Verificação pós-limpeza
npx ts-prune
npx depcheck

# 4. Teste se tudo ainda funciona
npm run build
npm run type-check
```

## ⚠️ Cuidados Importantes

1. **Sempre teste após limpeza**: Execute `npm run build` e `npm run type-check`
2. **Revise exports**: ts-prune pode mostrar exports que são utilizados dinamicamente
3. **Dependências especiais**: Algumas dependências podem ser usadas apenas em build/runtime
4. **Backup**: Considere fazer commit antes de grandes limpezas

## 🔄 Configuração ESLint

O ESLint foi configurado com as regras:

```javascript
"unused-imports/no-unused-imports": "error",
"unused-imports/no-unused-vars": [
  "warn",
  { 
    "vars": "all", 
    "varsIgnorePattern": "^_", 
    "args": "after-used", 
    "argsIgnorePattern": "^_" 
  }
]
```

## 📈 Benefícios

- ⚡ **Performance**: Menos código = bundle menor e build mais rápido
- 🧹 **Manutenibilidade**: Código mais limpo e organizado  
- 🔍 **Detecção precoce**: Encontra problemas antes que se acumulem
- 📦 **Dependências**: Remove packages desnecessários do node_modules

## 🎯 Resultados Esperados

Após executar as ferramentas, você deve ter:

- ✅ Zero imports não utilizados
- ✅ Apenas dependências realmente necessárias
- ✅ Exports limpos e organizados
- ✅ Código mais performático e maintível