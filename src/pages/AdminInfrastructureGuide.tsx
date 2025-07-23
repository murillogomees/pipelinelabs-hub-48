import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Server, 
  GitBranch, 
  Shield, 
  Code, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";

export default function AdminInfrastructureGuide() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guia de Infraestrutura</h1>
          <p className="text-muted-foreground">
            Configurações externas necessárias para staging, rollback e load balancing
          </p>
        </div>
        <Badge variant="outline" className="text-blue-600">
          Configuração Manual
        </Badge>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Esta página documenta as configurações que devem ser feitas fora do Lovable. 
          Os componentes de interface já estão implementados no sistema.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="staging" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="staging">Ambiente Staging</TabsTrigger>
          <TabsTrigger value="rollback">Rollback Strategy</TabsTrigger>
          <TabsTrigger value="loadbalancer">Load Balancer</TabsTrigger>
        </TabsList>

        <TabsContent value="staging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Configuração do Ambiente de Staging
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">1. Projeto Supabase Separado</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">No Dashboard do Supabase:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Criar novo projeto: <code>pipeline-staging</code></li>
                    <li>Copiar todas as migrações SQL do projeto principal</li>
                    <li>Configurar variáveis de ambiente diferentes</li>
                    <li>Ativar autenticação com mesmas configurações</li>
                    <li>Importar dados mascarados para testes</li>
                  </ol>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">2. Deploy Automático via GitHub Actions</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Arquivo: <code>.github/workflows/staging.yml</code></h4>
                  <pre className="text-xs bg-background p-3 rounded overflow-auto">
{`name: Deploy Staging
on:
  push:
    branches: [develop]
  pull_request:
    branches: [develop]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod --scope=staging'
          
      - name: Run Supabase migrations
        run: |
          npx supabase login --token \${{ secrets.SUPABASE_ACCESS_TOKEN }}
          npx supabase link --project-ref \${{ secrets.STAGING_PROJECT_REF }}
          npx supabase db push`}
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">3. Domínio Personalizado</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">No Vercel Dashboard:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Adicionar domínio: <code>staging.pipelinelabs.app</code></li>
                    <li>Configurar DNS CNAME apontando para Vercel</li>
                    <li>Ativar SSL automático</li>
                    <li>Configurar variáveis de ambiente específicas para staging</li>
                  </ol>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Status:</strong> O sistema já detecta automaticamente o ambiente staging 
                  e ajusta configurações através do arquivo <code>src/utils/environment.ts</code>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rollback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Estratégia de Rollback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">1. GitHub Actions para Rollback</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Arquivo: <code>.github/workflows/rollback.yml</code></h4>
                  <pre className="text-xs bg-background p-3 rounded overflow-auto">
{`name: Emergency Rollback
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      commit_sha:
        description: 'Commit SHA to rollback to'
        required: true
        type: string
      reason:
        description: 'Reason for rollback'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: \${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: \${{ inputs.commit_sha }}
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Deploy rollback
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          
      - name: Log rollback
        run: |
          echo "Rollback executed: \${{ inputs.reason }}"
          echo "Environment: \${{ inputs.environment }}"
          echo "Commit: \${{ inputs.commit_sha }}"`}
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">2. Vercel Rollback Automático</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Comandos via CLI:</h4>
                  <pre className="text-xs bg-background p-3 rounded">
{`# Listar deployments recentes
vercel ls --scope=your-team

# Fazer rollback para deployment específico
vercel rollback [deployment-url] --scope=your-team

# Rollback para versão anterior
vercel rollback --scope=your-team`}
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">3. Monitoramento e Alertas</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Ferramentas recomendadas:</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><strong>Sentry:</strong> Monitoramento de erros em tempo real</li>
                    <li><strong>Vercel Analytics:</strong> Performance e disponibilidade</li>
                    <li><strong>UptimeRobot:</strong> Monitoramento de uptime</li>
                    <li><strong>Slack/Discord:</strong> Notificações de deploys e rollbacks</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Status:</strong> Interface de rollback já implementada no admin. 
                  Acesse <code>/app/admin/versions</code> para gerenciar rollbacks.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loadbalancer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Load Balancer e Alta Disponibilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">1. Vercel Edge Network (Automático)</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Recursos já inclusos:</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>CDN global com 100+ pontos de presença</li>
                    <li>Load balancing automático entre regiões</li>
                    <li>Edge caching inteligente</li>
                    <li>Failover automático</li>
                    <li>DDoS protection básica</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">2. Cloudflare Load Balancer (Opcional)</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Para controle avançado:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Configurar domínio no Cloudflare</li>
                    <li>Ativar Load Balancing (plano Pro+)</li>
                    <li>Definir pools de origem (Vercel endpoints)</li>
                    <li>Configurar health checks automáticos</li>
                    <li>Definir regras de failover</li>
                  </ol>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">3. Supabase Read Replicas</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Para alta disponibilidade de dados:</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Configurar read replicas em regiões diferentes</li>
                    <li>Implementar connection pooling</li>
                    <li>Usar PgBouncer para otimização</li>
                    <li>Configurar backup automático</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">4. Health Checks e Monitoramento</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Endpoints já implementados:</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><code>/functions/v1/health-check</code> - Health check da API</li>
                    <li>Monitoramento de Supabase, Auth e Storage</li>
                    <li>Verificação de integrações externas (NFe.io)</li>
                    <li>Logs automáticos de saúde do sistema</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Status:</strong> Dashboard de monitoramento disponível em 
                  <code>/app/admin/versions</code> na aba "Monitoramento".
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Recursos Já Implementados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✅ Implementado no Código</h4>
              <ul className="text-sm space-y-1">
                <li>• Detecção automática de ambiente</li>
                <li>• Interface de rollback no admin</li>
                <li>• Health checks da API</li>
                <li>• Monitoramento de sistema</li>
                <li>• Logs de deployment</li>
                <li>• Controle de versões</li>
                <li>• Banner de ambiente</li>
                <li>• Configurações por ambiente</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-orange-600">⚙️ Configuração Externa</h4>
              <ul className="text-sm space-y-1">
                <li>• Projeto Supabase staging</li>
                <li>• GitHub Actions workflows</li>
                <li>• Domínios DNS</li>
                <li>• Vercel/Cloudflare config</li>
                <li>• Certificados SSL</li>
                <li>• Monitoramento externo</li>
                <li>• Alertas e notificações</li>
                <li>• Backup automático</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}