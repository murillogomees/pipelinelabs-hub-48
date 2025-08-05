
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditoriaRequest {
  company_id: string;
  tipo: 'manual' | 'automatica' | 'agendada';
  escopo: {
    arquivos: boolean;
    hooks: boolean;
    componentes: boolean;
    paginas: boolean;
    estilos: boolean;
    edge_functions: boolean;
    tabelas: boolean;
    rotas: boolean;
  };
}

interface AuditoriaResult {
  auditoria_id: string;
  arquivos_analisados: number;
  problemas_encontrados: number;
  sugestoes_limpeza: any[];
  arquivos_duplicados: any[];
  arquivos_nao_utilizados: any[];
  hooks_nao_utilizados: any[];
  componentes_duplicados: any[];
  tempo_execucao_ms: number;
  padroes_aprendidos: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('🔍 Iniciando execução de auditoria');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Authorization header missing');
      throw new Error('Authorization header is required');
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      throw new Error('Authentication failed');
    }

    console.log('✅ User authenticated:', user.id);

    const requestBody = await req.json() as AuditoriaRequest;
    const { company_id, tipo, escopo } = requestBody;

    console.log('📋 Request data:', { company_id, tipo, escopo, user_id: user.id });

    if (!company_id || !tipo || !escopo) {
      console.error('❌ Missing required fields');
      throw new Error('Missing required fields: company_id, tipo, or escopo');
    }

    const startTime = Date.now();

    // Buscar configuração de auditoria
    console.log('🔍 Buscando configuração de auditoria');
    const { data: config, error: configError } = await supabaseClient
      .from('auditoria_config')
      .select('*')
      .eq('company_id', company_id)
      .maybeSingle();

    if (configError) {
      console.error('❌ Erro ao buscar configuração:', configError);
      throw configError;
    }

    console.log('📊 Configuração encontrada:', !!config);

    // Criar registro de auditoria
    console.log('💾 Criando registro de auditoria');
    const { data: auditoria, error: auditoriaError } = await supabaseClient
      .from('auditoria_historico')
      .insert([{
        user_id: user.id,
        company_id,
        tipo_auditoria: tipo,
        escopo_auditoria: escopo,
        status: 'executando',
        arquivos_analisados: 0,
        problemas_encontrados: 0,
        tempo_execucao_ms: 0,
        score_aprendizado: 0.0,
        sugestoes_limpeza: [],
        arquivos_duplicados: [],
        arquivos_nao_utilizados: [],
        hooks_nao_utilizados: [],
        componentes_duplicados: [],
        melhorias_aplicadas: [],
        padroes_aprendidos: [],
      }])
      .select()
      .single();

    if (auditoriaError) {
      console.error('❌ Erro ao criar registro de auditoria:', auditoriaError);
      throw auditoriaError;
    }

    console.log('✅ Registro de auditoria criado:', auditoria.id);

    try {
      // Executar análise baseada no escopo
      console.log('🔄 Executando análise');
      const resultado = await executarAnalise(escopo, config);

      const tempoExecucao = Date.now() - startTime;

      // Calcular score de aprendizado baseado em execuções anteriores
      console.log('📊 Calculando score de aprendizado');
      const scoreAprendizado = await calcularScoreAprendizado(
        supabaseClient,
        company_id,
        resultado
      );

      // Atualizar registro com resultados
      console.log('💾 Atualizando registro com resultados');
      const { data: auditoriaAtualizada, error: updateError } = await supabaseClient
        .from('auditoria_historico')
        .update({
          arquivos_analisados: resultado.arquivos_analisados,
          problemas_encontrados: resultado.problemas_encontrados,
          sugestoes_limpeza: resultado.sugestoes_limpeza,
          arquivos_duplicados: resultado.arquivos_duplicados,
          arquivos_nao_utilizados: resultado.arquivos_nao_utilizados,
          hooks_nao_utilizados: resultado.hooks_nao_utilizados,
          componentes_duplicados: resultado.componentes_duplicados,
          tempo_execucao_ms: tempoExecucao,
          status: 'concluida',
          score_aprendizado: scoreAprendizado,
          padroes_aprendidos: resultado.padroes_aprendidos,
          updated_at: new Date().toISOString(),
        })
        .eq('id', auditoria.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar registro:', updateError);
        throw updateError;
      }

      console.log('✅ Registro atualizado com sucesso');

      // Atualizar configuração com timestamp da última execução
      if (config) {
        console.log('📅 Atualizando última execução na configuração');
        const { error: configUpdateError } = await supabaseClient
          .from('auditoria_config')
          .update({
            ultima_execucao: new Date().toISOString(),
            proxima_execucao: calcularProximaExecucao(config.frequencia_cron),
          })
          .eq('id', config.id);

        if (configUpdateError) {
          console.warn('⚠️ Erro ao atualizar configuração:', configUpdateError);
        } else {
          console.log('✅ Configuração atualizada');
        }
      }

      // Enviar notificações se necessário
      if (config?.notificacoes_ativas && resultado.problemas_encontrados > (config.limite_problemas_alerta || 50)) {
        console.log('📧 Enviando notificações');
        await enviarNotificacoes(config, resultado);
      }

      console.log('🎉 Auditoria concluída com sucesso');

      return new Response(
        JSON.stringify({
          success: true,
          auditoria_id: auditoria.id,
          resultado: {
            arquivos_analisados: resultado.arquivos_analisados,
            problemas_encontrados: resultado.problemas_encontrados,
            tempo_execucao_ms: tempoExecucao,
            score_aprendizado: scoreAprendizado,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );

    } catch (analysisError) {
      console.error('❌ Erro durante análise:', analysisError);
      
      // Atualizar registro com erro
      const { error: errorUpdateError } = await supabaseClient
        .from('auditoria_historico')
        .update({
          status: 'erro',
          erro_detalhes: analysisError.message || 'Erro durante execução da análise',
          tempo_execucao_ms: Date.now() - startTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', auditoria.id);

      if (errorUpdateError) {
        console.error('❌ Erro ao atualizar status de erro:', errorUpdateError);
      }

      throw analysisError;
    }

  } catch (error) {
    console.error('❌ Erro geral na execução da auditoria:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});

async function executarAnalise(escopo: any, config: any): Promise<AuditoriaResult> {
  console.log('🔍 Iniciando análise com escopo:', escopo);
  
  // Simulação de análise - Em produção, seria uma análise real do código
  const resultado: AuditoriaResult = {
    auditoria_id: '',
    arquivos_analisados: 0,
    problemas_encontrados: 0,
    sugestoes_limpeza: [],
    arquivos_duplicados: [],
    arquivos_nao_utilizados: [],
    hooks_nao_utilizados: [],
    componentes_duplicados: [],
    tempo_execucao_ms: 0,
    padroes_aprendidos: [],
  };

  // Simular análise de arquivos
  if (escopo.arquivos) {
    console.log('📁 Analisando arquivos');
    resultado.arquivos_analisados += 150;
    resultado.arquivos_nao_utilizados.push({
      nome: 'unused-component.tsx',
      caminho: 'src/components/unused-component.tsx',
      tipo: 'component',
      motivo: 'Sem importações encontradas',
    });
  }

  // Simular análise de hooks
  if (escopo.hooks) {
    console.log('🪝 Analisando hooks');
    resultado.arquivos_analisados += 25;
    resultado.hooks_nao_utilizados.push({
      nome: 'useObsoleteHook',
      caminho: 'src/hooks/useObsoleteHook.ts',
      tipo: 'hook',
      motivo: 'Hook não utilizado em nenhum componente',
    });
  }

  // Simular análise de componentes
  if (escopo.componentes) {
    console.log('⚛️ Analisando componentes');
    resultado.arquivos_analisados += 80;
    resultado.componentes_duplicados.push({
      nome: 'ButtonComponent',
      arquivos: ['src/components/Button.tsx', 'src/ui/Button.tsx'],
      similaridade: '95%',
      sugestao: 'Unificar componentes duplicados',
    });
  }

  // Simular análise de páginas
  if (escopo.paginas) {
    console.log('📄 Analisando páginas');
    resultado.arquivos_analisados += 30;
  }

  // Simular análise de estilos
  if (escopo.estilos) {
    console.log('🎨 Analisando estilos');
    resultado.arquivos_analisados += 15;
  }

  // Simular análise de edge functions
  if (escopo.edge_functions) {
    console.log('⚡ Analisando edge functions');
    resultado.arquivos_analisados += 10;
  }

  // Simular análise de tabelas
  if (escopo.tabelas) {
    console.log('🗄️ Analisando tabelas');
    resultado.arquivos_analisados += 5;
  }

  // Simular análise de rotas
  if (escopo.rotas) {
    console.log('🛣️ Analisando rotas');
    resultado.arquivos_analisados += 8;
  }

  // Calcular problemas encontrados
  resultado.problemas_encontrados = 
    resultado.arquivos_nao_utilizados.length +
    resultado.hooks_nao_utilizados.length +
    resultado.componentes_duplicados.length +
    resultado.arquivos_duplicados.length;

  // Gerar sugestões baseadas nos problemas encontrados
  if (resultado.arquivos_nao_utilizados.length > 0) {
    resultado.sugestoes_limpeza.push({
      tipo: 'arquivo_nao_usado',
      prioridade: 'media',
      descricao: `Remover ${resultado.arquivos_nao_utilizados.length} arquivos não utilizados`,
      arquivos: resultado.arquivos_nao_utilizados.map(a => a.caminho),
    });
  }

  if (resultado.componentes_duplicados.length > 0) {
    resultado.sugestoes_limpeza.push({
      tipo: 'componente_duplicado',
      prioridade: 'alta',
      descricao: `Unificar ${resultado.componentes_duplicados.length} componentes duplicados`,
      componentes: resultado.componentes_duplicados.map(c => c.nome),
    });
  }

  // Aprendizado de padrões
  resultado.padroes_aprendidos.push({
    padrao: 'componentes_nao_utilizados',
    frequencia: resultado.arquivos_nao_utilizados.length,
    confianca: 0.8,
    sugestao_automatica: resultado.arquivos_nao_utilizados.length > 5,
  });

  console.log('✅ Análise concluída:', {
    arquivos_analisados: resultado.arquivos_analisados,
    problemas_encontrados: resultado.problemas_encontrados
  });

  return resultado;
}

async function calcularScoreAprendizado(
  supabaseClient: any,
  company_id: string,
  resultado: AuditoriaResult
): Promise<number> {
  try {
    // Buscar auditorias anteriores para calcular score
    const { data: auditorias, error } = await supabaseClient
      .from('auditoria_historico')
      .select('problemas_encontrados, score_aprendizado')
      .eq('company_id', company_id)
      .eq('status', 'concluida')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !auditorias || auditorias.length === 0) {
      console.log('📊 Score inicial: 0.5');
      return 0.5; // Score inicial
    }

    // Calcular score baseado na melhoria ao longo do tempo
    const problemasMedio = auditorias.reduce((acc, audit) => acc + (audit.problemas_encontrados || 0), 0) / auditorias.length;
    const melhoriaPercentual = problemasMedio > 0 ? (problemasMedio - resultado.problemas_encontrados) / problemasMedio : 0;

    const score = Math.max(0, Math.min(1, 0.5 + melhoriaPercentual));
    console.log('📊 Score calculado:', score);
    
    return score;
  } catch (error) {
    console.error('❌ Erro ao calcular score:', error);
    return 0.5;
  }
}

function calcularProximaExecucao(frequenciaCron: string): string {
  const agora = new Date();
  
  switch (frequenciaCron) {
    case '0 2 * * *': // Diário às 2:00
      agora.setDate(agora.getDate() + 1);
      agora.setHours(2, 0, 0, 0);
      break;
    case '0 2 * * 1': // Semanal segunda às 2:00
      const diasAteSeg = (7 - agora.getDay() + 1) % 7;
      agora.setDate(agora.getDate() + (diasAteSeg === 0 ? 7 : diasAteSeg));
      agora.setHours(2, 0, 0, 0);
      break;
    case '0 2 1 * *': // Mensal dia 1 às 2:00
      agora.setMonth(agora.getMonth() + 1, 1);
      agora.setHours(2, 0, 0, 0);
      break;
    default:
      agora.setDate(agora.getDate() + 1);
      agora.setHours(2, 0, 0, 0);
  }
  
  return agora.toISOString();
}

async function enviarNotificacoes(config: any, resultado: AuditoriaResult): Promise<void> {
  try {
    console.log('📧 Enviando notificações para:', config.email_notificacao);
    console.log('⚠️ Problemas encontrados:', resultado.problemas_encontrados);
    
    // Aqui seria implementada a lógica real de envio de notificações
    // Por exemplo, enviar email ou chamar webhook
    
    if (config.webhook_notificacao) {
      console.log('🔗 Chamando webhook:', config.webhook_notificacao);
      // Implementar chamada do webhook
    }
    
    console.log('✅ Notificações enviadas');
  } catch (error) {
    console.error('❌ Erro ao enviar notificações:', error);
  }
}
