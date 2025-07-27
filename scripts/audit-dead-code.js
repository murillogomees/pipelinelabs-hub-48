
#!/usr/bin/env node

/**
 * Script de auditoria completa para detectar código morto e duplicações
 * Analisa toda a estrutura do projeto identificando arquivos e funcionalidades não utilizadas
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Iniciando auditoria técnica completa...\n');

// Configurações
const CONFIG = {
  srcDir: './src',
  pagesDir: './src/pages',
  componentsDir: './src/components',
  hooksDir: './src/hooks',
  utilsDir: './src/utils',
  libDir: './src/lib',
  supabaseFunctionsDir: './supabase/functions',
  stylesDir: './src/styles',
  excludePatterns: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    '.env',
    'package-lock.json',
    'yarn.lock',
    'bun.lockb'
  ]
};

// Função para coletar todos os arquivos
function getAllFiles(dir, fileList = [], extension = '') {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!CONFIG.excludePatterns.some(pattern => file.includes(pattern))) {
        getAllFiles(filePath, fileList, extension);
      }
    } else if (!extension || file.endsWith(extension)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Função para analisar imports/exports
function analyzeImportsExports(content) {
  const imports = [];
  const exports = [];
  
  // Regex para imports
  const importRegex = /import\s+(?:(?:\{[^}]*\})|(?:[^,\s]+)|\*\s+as\s+[^,\s]+)(?:\s*,\s*(?:\{[^}]*\}|[^,\s]+|\*\s+as\s+[^,\s]+))*\s+from\s+['"]([^'"]+)['"]/g;
  
  // Regex para exports
  const exportRegex = /export\s+(?:default\s+)?(?:(?:const|let|var|function|class|interface|type)\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  
  return { imports, exports };
}

// Função para detectar código morto
function detectDeadCode() {
  console.log('📋 Analisando código morto...\n');
  
  const results = {
    unusedFiles: [],
    unusedExports: [],
    unusedImports: [],
    duplicateComponents: [],
    unusedHooks: [],
    unusedUtils: [],
    unusedPages: [],
    unusedStyles: []
  };
  
  // Coletar todos os arquivos TypeScript/JavaScript
  const allFiles = getAllFiles(CONFIG.srcDir, [], '.ts').concat(
    getAllFiles(CONFIG.srcDir, [], '.tsx'),
    getAllFiles(CONFIG.srcDir, [], '.js'),
    getAllFiles(CONFIG.srcDir, [], '.jsx')
  );
  
  const fileContents = new Map();
  const allImports = new Map();
  const allExports = new Map();
  
  // Analisar cada arquivo
  allFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      fileContents.set(filePath, content);
      
      const analysis = analyzeImportsExports(content);
      allImports.set(filePath, analysis.imports);
      allExports.set(filePath, analysis.exports);
    } catch (error) {
      console.warn(`⚠️ Erro ao ler ${filePath}:`, error.message);
    }
  });
  
  // Detectar arquivos não utilizados
  const referencedFiles = new Set();
  
  allImports.forEach((imports, filePath) => {
    imports.forEach(importPath => {
      // Resolver caminho do import
      const resolvedPath = resolveImportPath(importPath, filePath);
      if (resolvedPath) {
        referencedFiles.add(resolvedPath);
      }
    });
  });
  
  allFiles.forEach(filePath => {
    if (!referencedFiles.has(filePath) && !isMainFile(filePath)) {
      results.unusedFiles.push(filePath);
    }
  });
  
  return results;
}

// Função para resolver caminho de import
function resolveImportPath(importPath, fromFile) {
  if (importPath.startsWith('.')) {
    const dir = path.dirname(fromFile);
    const resolved = path.resolve(dir, importPath);
    
    // Tentar diferentes extensões
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
    
    for (const ext of extensions) {
      const fullPath = resolved + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
  }
  
  return null;
}

// Função para verificar se é arquivo principal
function isMainFile(filePath) {
  const mainFiles = [
    'src/main.tsx',
    'src/index.tsx',
    'src/App.tsx',
    'src/vite-env.d.ts'
  ];
  
  return mainFiles.some(main => filePath.includes(main));
}

// Função para detectar duplicações
function detectDuplicates() {
  console.log('🔍 Detectando duplicações...\n');
  
  const duplicates = {
    components: [],
    hooks: [],
    utils: [],
    styles: []
  };
  
  // Analisar componentes similares
  const componentFiles = getAllFiles(CONFIG.componentsDir, [], '.tsx');
  const componentNames = new Map();
  
  componentFiles.forEach(filePath => {
    const fileName = path.basename(filePath, '.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extrair nome do componente principal
    const componentMatch = content.match(/export\s+(?:default\s+)?(?:const|function)\s+([A-Z][a-zA-Z0-9]*)/);
    if (componentMatch) {
      const componentName = componentMatch[1];
      
      if (componentNames.has(componentName)) {
        duplicates.components.push({
          name: componentName,
          files: [componentNames.get(componentName), filePath]
        });
      } else {
        componentNames.set(componentName, filePath);
      }
    }
  });
  
  return duplicates;
}

// Função para analisar hooks não utilizados
function analyzeUnusedHooks() {
  console.log('🔧 Analisando hooks não utilizados...\n');
  
  const hookFiles = getAllFiles(CONFIG.hooksDir, [], '.ts').concat(
    getAllFiles(CONFIG.hooksDir, [], '.tsx')
  );
  
  const unusedHooks = [];
  const allSourceFiles = getAllFiles(CONFIG.srcDir, [], '.tsx');
  
  hookFiles.forEach(hookFile => {
    const hookName = path.basename(hookFile, path.extname(hookFile));
    let isUsed = false;
    
    allSourceFiles.forEach(sourceFile => {
      if (sourceFile !== hookFile) {
        const content = fs.readFileSync(sourceFile, 'utf8');
        if (content.includes(hookName)) {
          isUsed = true;
        }
      }
    });
    
    if (!isUsed) {
      unusedHooks.push(hookFile);
    }
  });
  
  return unusedHooks;
}

// Função para analisar páginas não utilizadas
function analyzeUnusedPages() {
  console.log('📄 Analisando páginas não utilizadas...\n');
  
  const pageFiles = getAllFiles(CONFIG.pagesDir, [], '.tsx');
  const unusedPages = [];
  
  // Verificar se as páginas estão sendo referenciadas no roteamento
  const routeFiles = getAllFiles(CONFIG.srcDir, [], '.tsx').filter(file => 
    file.includes('route') || file.includes('App.tsx') || file.includes('router')
  );
  
  let routeContent = '';
  routeFiles.forEach(file => {
    routeContent += fs.readFileSync(file, 'utf8');
  });
  
  pageFiles.forEach(pageFile => {
    const pageName = path.basename(pageFile, '.tsx');
    if (!routeContent.includes(pageName)) {
      unusedPages.push(pageFile);
    }
  });
  
  return unusedPages;
}

// Função para analisar Edge Functions não utilizadas
function analyzeUnusedEdgeFunctions() {
  console.log('⚡ Analisando Edge Functions não utilizadas...\n');
  
  if (!fs.existsSync(CONFIG.supabaseFunctionsDir)) {
    return [];
  }
  
  const functionDirs = fs.readdirSync(CONFIG.supabaseFunctionsDir)
    .filter(item => fs.statSync(path.join(CONFIG.supabaseFunctionsDir, item)).isDirectory());
  
  const unusedFunctions = [];
  const allSourceFiles = getAllFiles(CONFIG.srcDir, [], '.ts').concat(
    getAllFiles(CONFIG.srcDir, [], '.tsx')
  );
  
  functionDirs.forEach(functionName => {
    let isUsed = false;
    
    allSourceFiles.forEach(sourceFile => {
      const content = fs.readFileSync(sourceFile, 'utf8');
      if (content.includes(functionName) || content.includes(`'${functionName}'`) || content.includes(`"${functionName}"`)) {
        isUsed = true;
      }
    });
    
    if (!isUsed) {
      unusedFunctions.push(functionName);
    }
  });
  
  return unusedFunctions;
}

// Função principal
async function runAudit() {
  console.log('='.repeat(60));
  console.log('🔍 AUDITORIA TÉCNICA COMPLETA - PIPELINE LABS');
  console.log('='.repeat(60));
  
  const results = {
    deadCode: detectDeadCode(),
    duplicates: detectDuplicates(),
    unusedHooks: analyzeUnusedHooks(),
    unusedPages: analyzeUnusedPages(),
    unusedEdgeFunctions: analyzeUnusedEdgeFunctions()
  };
  
  // Executar ferramentas externas
  console.log('\n📦 Executando ferramentas de análise...\n');
  
  try {
    console.log('Executando ts-prune...');
    execSync('npx ts-prune', { stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️ ts-prune não pôde ser executado');
  }
  
  try {
    console.log('\nExecutando depcheck...');
    execSync('npx depcheck', { stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️ depcheck não pôde ser executado');
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL DA AUDITORIA');
  console.log('='.repeat(60));
  
  console.log('\n🗂️ ARQUIVOS NÃO UTILIZADOS:');
  if (results.deadCode.unusedFiles.length > 0) {
    results.deadCode.unusedFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
  } else {
    console.log('  ✅ Nenhum arquivo não utilizado encontrado');
  }
  
  console.log('\n🔧 HOOKS NÃO UTILIZADOS:');
  if (results.unusedHooks.length > 0) {
    results.unusedHooks.forEach(hook => {
      console.log(`  - ${hook}`);
    });
  } else {
    console.log('  ✅ Todos os hooks estão sendo utilizados');
  }
  
  console.log('\n📄 PÁGINAS NÃO UTILIZADAS:');
  if (results.unusedPages.length > 0) {
    results.unusedPages.forEach(page => {
      console.log(`  - ${page}`);
    });
  } else {
    console.log('  ✅ Todas as páginas estão sendo utilizadas');
  }
  
  console.log('\n⚡ EDGE FUNCTIONS NÃO UTILIZADAS:');
  if (results.unusedEdgeFunctions.length > 0) {
    results.unusedEdgeFunctions.forEach(func => {
      console.log(`  - ${func}`);
    });
  } else {
    console.log('  ✅ Todas as Edge Functions estão sendo utilizadas');
  }
  
  console.log('\n📊 DUPLICAÇÕES ENCONTRADAS:');
  if (results.duplicates.components.length > 0) {
    results.duplicates.components.forEach(duplicate => {
      console.log(`  - Componente duplicado: ${duplicate.name}`);
      duplicate.files.forEach(file => {
        console.log(`    • ${file}`);
      });
    });
  } else {
    console.log('  ✅ Nenhuma duplicação de componente encontrada');
  }
  
  console.log('\n💡 RECOMENDAÇÕES:');
  console.log('  1. Revise os arquivos listados como não utilizados');
  console.log('  2. Confirme se as duplicações são realmente desnecessárias');
  console.log('  3. Execute testes após qualquer remoção');
  console.log('  4. Considere refatorar código duplicado');
  
  console.log('\n🎉 Auditoria completa finalizada!\n');
  
  // Salvar relatório
  const reportPath = './audit-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Relatório salvo em: ${reportPath}`);
}

// Executar auditoria
runAudit().catch(console.error);
