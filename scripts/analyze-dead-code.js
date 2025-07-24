#!/usr/bin/env node

/**
 * Script para análise completa de código morto
 * Executa ts-prune, depcheck e eslint para detectar arquivos/dependências não utilizados
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando análise de código morto...\n');

// Função para executar comandos e capturar output
function runCommand(command, description) {
  console.log(`📋 ${description}`);
  console.log(`Executando: ${command}\n`);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      cwd: process.cwd(),
      stdio: 'pipe' 
    });
    return output;
  } catch (error) {
    console.error(`❌ Erro ao executar: ${command}`);
    console.error(error.stdout || error.message);
    return null;
  }
}

// 1. Análise de exports não utilizados com ts-prune
console.log('='.repeat(60));
console.log('1️⃣  ANÁLISE DE EXPORTS NÃO UTILIZADOS (ts-prune)');
console.log('='.repeat(60));

const tsPruneOutput = runCommand('npx ts-prune --error', 'Verificando exports TypeScript não utilizados');
if (tsPruneOutput) {
  if (tsPruneOutput.trim()) {
    console.log('⚠️  Exports não utilizados encontrados:');
    console.log(tsPruneOutput);
  } else {
    console.log('✅ Nenhum export não utilizado encontrado!');
  }
} else {
  console.log('⚠️  ts-prune não executou corretamente');
}

console.log('\n');

// 2. Análise de dependências não utilizadas com depcheck
console.log('='.repeat(60));
console.log('2️⃣  ANÁLISE DE DEPENDÊNCIAS NÃO UTILIZADAS (depcheck)');
console.log('='.repeat(60));

const depcheckOutput = runCommand('npx depcheck --json', 'Verificando dependências não utilizadas');
if (depcheckOutput) {
  try {
    const depcheckResult = JSON.parse(depcheckOutput);
    
    if (depcheckResult.dependencies && depcheckResult.dependencies.length > 0) {
      console.log('📦 Dependências não utilizadas:');
      depcheckResult.dependencies.forEach(dep => console.log(`  - ${dep}`));
    } else {
      console.log('✅ Nenhuma dependência não utilizada encontrada!');
    }
    
    if (depcheckResult.devDependencies && depcheckResult.devDependencies.length > 0) {
      console.log('\n🛠️  DevDependencies não utilizadas:');
      depcheckResult.devDependencies.forEach(dep => console.log(`  - ${dep}`));
    }
    
    if (depcheckResult.missing && Object.keys(depcheckResult.missing).length > 0) {
      console.log('\n❌ Dependências em falta:');
      Object.entries(depcheckResult.missing).forEach(([dep, files]) => {
        console.log(`  - ${dep} (usado em: ${files.join(', ')})`);
      });
    }
  } catch (error) {
    console.error('❌ Erro ao parsear resultado do depcheck:', error.message);
  }
} else {
  console.log('⚠️  depcheck não executou corretamente');
}

console.log('\n');

// 3. Análise de imports não utilizados com ESLint
console.log('='.repeat(60));
console.log('3️⃣  ANÁLISE DE IMPORTS NÃO UTILIZADOS (ESLint)');
console.log('='.repeat(60));

const eslintOutput = runCommand('npx eslint src --ext .ts,.tsx --format compact', 'Verificando imports não utilizados');
if (eslintOutput) {
  const unusedImportsLines = eslintOutput
    .split('\n')
    .filter(line => line.includes('unused-imports/no-unused-imports'));
  
  if (unusedImportsLines.length > 0) {
    console.log('📥 Imports não utilizados encontrados:');
    unusedImportsLines.forEach(line => console.log(`  ${line}`));
  } else {
    console.log('✅ Nenhum import não utilizado encontrado!');
  }
} else {
  console.log('⚠️  ESLint não executou corretamente');
}

console.log('\n');

// 4. Relatório final
console.log('='.repeat(60));
console.log('📊 RELATÓRIO FINAL');
console.log('='.repeat(60));

console.log(`
💡 DICAS PARA LIMPEZA:

1. Para remover imports automaticamente:
   npx eslint src --ext .ts,.tsx --fix

2. Para remover dependências não utilizadas:
   npm uninstall <package-name>

3. Para exports não utilizados:
   Revisar manualmente os arquivos listados pelo ts-prune

4. Script de limpeza automática:
   npm run clean:dead-code
`);

console.log('🎉 Análise completa finalizada!\n');