import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "API Key do Gemini não encontrada. Por favor, configure a secret 'GEMINI_API_KEY' no painel do Supabase Edge Functions.",
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const systemPrompt = `Você é um teólogo, pastor e escritor cristão extremamente experiente e inspirador.
Sua tarefa é gerar um devocional diário com profundidade teológica, rigor bíblico e aplicação prática contundente.
Mantenha o texto total entre 400 e 600 palavras para garantir estabilidade na geração do JSON. Textos muito longos podem ser cortados.

Escolha aleatoriamente um texto bíblico edificante e rico para o devocional de hoje.

Responda OBRIGATORIAMENTE em formato JSON válido com a seguinte estrutura exata:
{
  "title": "Um título chamativo e reflexivo para o devocional",
  "baseText": "Referência Bíblica (ex: Salmos 23:1-3)",
  "reading": "O texto bíblico completo da referência, seguido OBRIGATORIAMENTE por uma explicação do contexto histórico.",
  "reflection": "Uma análise teológica seguida de uma aplicação prática detalhada para a vida moderna e insights espirituais.",
  "prayer": "Uma oração final personalizada e profunda."
}

IMPORTANTE E CRÍTICO PARA O SISTEMA:
1. A resposta deve ser UM JSON PERFEITAMENTE VÁLIDO.
2. NUNCA use quebras de linha literais (Enter) dentro das strings. Use SEMPRE o texto contínuo ou o escape literal '\\n' para separar parágrafos.
3. Escape corretamente TODAS as aspas duplas internas dentro das strings usando '\\"'.
4. Certifique-se de NÃO CORTAR a resposta no meio. Feche corretamente todas as chaves '}'.`

    const userPrompt = 'Gere o devocional diário de hoje com profundidade teológica, contexto histórico, aplicações modernas. Seja direto e não exceda 600 palavras para evitar corte na resposta. Retorne APENAS o JSON válido.'

    const maxRetries = 2;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              contents: [
                {
                  role: 'user',
                  parts: [{ text: userPrompt }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
                responseSchema: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING" },
                    baseText: { type: "STRING" },
                    reading: { type: "STRING" },
                    reflection: { type: "STRING" },
                    prayer: { type: "STRING" }
                  },
                  required: ["title", "baseText", "reading", "reflection", "prayer"]
                },
              },
            }),
          },
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error?.message || 'Erro ao chamar API do Gemini')
        }

        if (!data.candidates || data.candidates.length === 0) {
          throw new Error('Nenhuma resposta gerada pela API do Gemini.')
        }

        let responseText = data.candidates[0].content?.parts?.[0]?.text || ''
        
        console.log(`=== RAW JSON FROM AI (Attempt ${attempt}) ===`);
        console.log(responseText);
        console.log("===========================================");

        let cleanText = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
        cleanText = cleanText.replace(/\\(?![nrt"\\/bfu])/g, '\\\\');

        let generatedContent;
        try {
          generatedContent = JSON.parse(cleanText);
        } catch (parseError: any) {
          console.warn(`[Attempt ${attempt}] JSON Parse Error:`, parseError.message);
          
          // Sanitização Anti-Quebra: Converte quebras literais para espaço e remove control chars
          let flatText = cleanText.replace(/[\u0000-\u0009\u000B-\u000C\u000E-\u001F]+/g, '');
          flatText = flatText.replace(/\n/g, ' ').replace(/\r/g, '');
          
          try {
            generatedContent = JSON.parse(flatText);
            console.log(`[Attempt ${attempt}] JSON recuperado com sucesso após remover quebras de linha literais!`);
          } catch (e2) {
             // Validação de Estrutura Estrita: Tentar fechar strings cortadas
             if (parseError.message.includes('Unterminated string')) {
                console.warn(`[Attempt ${attempt}] Tentando fechar string não terminada...`);
                let fixedText = flatText + '"}';
                try {
                  generatedContent = JSON.parse(fixedText);
                  console.log(`[Attempt ${attempt}] JSON recuperado com sucesso após forçar fechamento!`);
                } catch (e3) {
                  throw parseError; // Joga o erro original para acionar o retry
                }
             } else {
                throw parseError;
             }
          }
        }

        return new Response(JSON.stringify(generatedContent), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        lastError = error;
      }
    }

    return new Response(
      JSON.stringify({ 
        error: "O conteúdo gerado pela IA apresentou um formato inválido ou foi interrompido. Tentamos corrigir automaticamente, mas não foi possível. Por favor, tente gerar novamente.",
        details: lastError?.message
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error("Internal Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno no servidor' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
