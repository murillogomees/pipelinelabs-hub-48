import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TONE_PROMPTS = {
  professional: "Você é um engenheiro de software sênior com ótima comunicação. Escreva um resumo profissional e empático, focando na clareza e impacto técnico.",
  didactic: "Você é um engenheiro de software sênior que ensina outros desenvolvedores. Escreva um resumo didático e explicativo, quebrando conceitos complexos em partes simples.",
  executive: "Você é um CTO experiente. Escreva um resumo executivo focando em impactos de negócio, riscos, custos e retorno sobre investimento.",
  technical: "Você é um tech writer especializado. Escreva um resumo no estilo documentação técnica, como um README ou RFC detalhado."
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notes, tone } = await req.json();

    if (!notes) {
      throw new Error('Conteúdo da nota é obrigatório');
    }

    if (!tone || !TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS]) {
      throw new Error('Tom inválido');
    }

    const systemPrompt = TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS];
    const userPrompt = `Resuma a visão técnica abaixo de forma clara e estruturada, destacando:
- Objetivo da ideia
- Possíveis áreas de aplicação
- Tecnologias envolvidas
- Considerações estratégicas (performance, escalabilidade, DX, etc)

Nota técnica:
"""
${notes}
"""`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const summary = data.choices[0].message.content;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-copilot function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});