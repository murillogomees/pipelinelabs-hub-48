#!/usr/bin/env node

/**
 * Script para limpeza automática de código morto
 * Remove automaticamente imports não utilizados e fornece sugestões para outras limpezas
 */

const { execSync } = require('child_process');

console.log('🧹 Iniciando limpeza automática de código morto...\n');

// Função para executar comandos
function runCommand(command, description) {
  console.log(`📋 ${description}`);
  console.log(`Executando: ${command}\n`);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      cwd: process.cwd(),
      stdio: 'inherit' 
    });
    return true;
  } catch (error) {
    console.error(`❌ Erro ao executar: ${command}`);
    return false;
  }
}

// 1. Remover imports não utilizados automaticamente
console.log('='.repeat(60));
console.log('1️⃣  REMOVENDO IMPORTS NÃO UTILIZADOS');
console.log('='.repeat(60));

const eslintSuccess = runCommand(
  'npx eslint src --ext .ts,.tsx --fix --rule "unused-imports/no-unused-imports: error"',
  'Removendo imports não utilizados com ESLint --fix'
);

if (eslintSuccess) {
  console.log('✅ Imports não utilizados removidos automaticamente!');
} else {
  console.log('⚠️  Alguns imports podem precisar de remoção manual');
}

console.log('\n');

// 2. Verificar se ainda há problemas
console.log('='.repeat(60));
console.log('2️⃣  VERIFICAÇÃO PÓS-LIMPEZA');
console.log('='.repeat(60));

runCommand('npm run analyze:dead-code', 'Executando análise completa após limpeza');

console.log('\n');

// 3. Dicas finais
console.log('='.repeat(60));
console.log('💡 PRÓXIMOS PASSOS');
console.log('='.repeat(60));

console.log(`
🎯 LIMPEZA AUTOMÁTICA CONCLUÍDA!

Para continuar a limpeza:

1. 📋 Revisar exports não utilizados:
   npx ts-prune

2. 📦 Remover dependências não utilizadas:
   npx depcheck

3. 🔄 Executar limpeza novamente:
   npm run clean:dead-code

4. ✅ Verificar build após limpeza:
   npm run build
   npm run type-check

Lembre-se de testar a aplicação após grandes remoções!
`);

console.log('🎉 Limpeza automática finalizada!\n');