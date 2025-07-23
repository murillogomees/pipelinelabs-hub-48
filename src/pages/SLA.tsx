import { useSLA } from '@/hooks/useSLA';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Shield, Zap } from 'lucide-react';

export default function SLA() {
  const { currentSLA, isLoading } = useSLA();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const guarantees = [
    {
      icon: CheckCircle,
      title: "99,9% de Disponibilidade",
      description: "Garantimos que nosso sistema estará disponível 99,9% do tempo mensalmente",
      details: ["Máximo de 44 minutos de indisponibilidade por mês", "Monitoramento 24/7", "Notificação automática de incidentes"]
    },
    {
      icon: Clock,
      title: "Tempo de Resposta",
      description: "Suporte técnico com tempos de resposta garantidos",
      details: ["Crítico: 1 hora", "Alto: 4 horas", "Médio: 8 horas", "Baixo: 24 horas"]
    },
    {
      icon: Shield,
      title: "Segurança de Dados",
      description: "Proteção completa dos seus dados com certificação SSL/TLS",
      details: ["Criptografia em trânsito e repouso", "Backup diário automático", "Conformidade LGPD"]
    },
    {
      icon: Zap,
      title: "Performance",
      description: "Tempo de resposta médio das API's",
      details: ["< 200ms para consultas", "< 500ms para operações", "< 1s para relatórios"]
    }
  ];

  const planCoverage = [
    {
      plan: "Básico",
      features: ["E-mail support", "Documentação online", "SLA básico"],
      responseTime: "24h"
    },
    {
      plan: "Profissional",
      features: ["Chat support", "Telefone", "SLA estendido", "Suporte prioritário"],
      responseTime: "8h"
    },
    {
      plan: "Enterprise",
      features: ["Suporte dedicado", "Gerente de conta", "SLA premium", "Suporte 24/7"],
      responseTime: "1h"
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Acordo de Nível de Serviço</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Nosso compromisso com a excelência no atendimento e disponibilidade do sistema
        </p>
        {currentSLA && (
          <Badge variant="secondary">
            Versão {currentSLA.version} - Vigente desde {new Date(currentSLA.effective_date).toLocaleDateString('pt-BR')}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {guarantees.map((guarantee, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <guarantee.icon className="h-8 w-8 text-primary" />
              <CardTitle className="text-lg">{guarantee.title}</CardTitle>
              <CardDescription>{guarantee.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {guarantee.details.map((detail, idx) => (
                  <li key={idx} className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {detail}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cobertura por Plano</CardTitle>
          <CardDescription>
            Diferentes níveis de suporte baseados no seu plano contratado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {planCoverage.map((coverage, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{coverage.plan}</h3>
                  <Badge variant={index === 2 ? "default" : "secondary"}>
                    Resposta em {coverage.responseTime}
                  </Badge>
                </div>
                <ul className="space-y-1">
                  {coverage.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compensações e Créditos</CardTitle>
          <CardDescription>
            O que acontece quando não cumprimos nossos compromissos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Disponibilidade Mensal</h4>
              <ul className="space-y-1 text-sm">
                <li>• 99,0% - 99,8%: Crédito de 10%</li>
                <li>• 98,0% - 98,9%: Crédito de 25%</li>
                <li>• Abaixo de 98,0%: Crédito de 50%</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tempo de Resposta</h4>
              <ul className="space-y-1 text-sm">
                <li>• Atraso de 2x: Crédito de 5%</li>
                <li>• Atraso de 5x: Crédito de 15%</li>
                <li>• Atraso de 10x: Crédito de 30%</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentSLA?.content && (
        <Card>
          <CardHeader>
            <CardTitle>Documento Completo do SLA</CardTitle>
            <CardDescription>
              Acesse o documento completo com todos os termos e condições
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: currentSLA.content }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}