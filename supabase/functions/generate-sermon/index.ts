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

    const {
      baseText,
      version,
      duration,
      sermonType = 'Expositivo',
      customOutline,
      custom_outline,
    } = await req.json()

    const outline = custom_outline || customOutline || ''

    const systemPrompt = `Você é um assistente teológico homilético experiente.
Sua tarefa é gerar um sermão estruturado com base no texto ou tema fornecido, utilizando a versão bíblica solicitada (${version}).
O estilo da pregação será: ${sermonType} (Expositivo ou Temático).
A duração estimada é de ${duration} minutos.

A estrutura do sermão DEVE seguir rigorosamente a homilética cristã e OBRIGATORIAMENTE incluir aplicações práticas:
1. Introdução
2. Proposição (A ideia central do sermão)
3. Tópicos Principais (Mínimo de 3 pontos. CADA PONTO DEVE CONTER UMA APLICAÇÃO PRÁTICA CLARA)
4. Ilustração
5. Conclusão e Aplicação Geral (Como a congregação deve viver essa verdade hoje, seguido de apelo final)

Responda OBRIGATORIAMENTE em formato JSON válido com a seguinte estrutura exata:
{
  "title": "Um título chamativo para o sermão",
  "content": {
    "intro": "Introdução...",
    "proposition": "Proposição...",
    "points": [
      { "title": "Ponto 1", "text": "Desenvolvimento e aplicação prática..." },
      { "title": "Ponto 2", "text": "Desenvolvimento e aplicação prática..." }
    ],
    "illustration": "Ilustração...",
    "conclusion": "Conclusão, aplicação geral e apelo..."
  },
  "insights": [
    "Dica prática 1...",
    "Dica prática 2..."
  ],
  "references": [
    "Livro Cap:Versículo - Breve explicação"
  ]
}

IMPORTANTE E CRÍTICO PARA O SISTEMA:
1. A resposta deve ser UM JSON PERFEITAMENTE VÁLIDO.
2. NUNCA use quebras de linha literais (Enter) dentro das strings. Use SEMPRE o escape literal '\\n' para separar parágrafos, ou faça texto contínuo.
3. Escape corretamente TODAS as aspas duplas internas dentro das strings usando '\\"'.
4. Seja conciso e direto nos textos para não estourar o limite de resposta. Evite gerar um JSON cortado pela metade. Certifique-se de fechar todas as chaves '}'.`

    const userPrompt = `Tema/Texto Base: ${baseText}\nVersão Bíblica: ${version}\nEstilo: ${sermonType}\nDuração estimada: ${duration} minutos.${outline ? `\n\nUse o seguinte roteiro como base: ${outline}` : ''}\n\nRetorne APENAS o JSON válido.`

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
                    content: {
                      type: "OBJECT",
                      properties: {
                        intro: { type: "STRING" },
                        proposition: { type: "STRING" },
                        points: {
                          type: "ARRAY",
                          items: {
                            type: "OBJECT",
                            properties: {
                              title: { type: "STRING" },
                              text: { type: "STRING" }
                            },
                            required: ["title", "text"]
                          }
                        },
                        illustration: { type: "STRING" },
                        conclusion: { type: "STRING" }
                      },
                      required: ["intro", "proposition", "points", "illustration", "conclusion"]
                    },
                    insights: {
                      type: "ARRAY",
                      items: { type: "STRING" }
                    },
                    references: {
                      type: "ARRAY",
                      items: { type: "STRING" }
                    }
                  },
                  required: ["title", "content", "insights", "references"]
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
          
          let flatText = cleanText.replace(/[\u0000-\u0009\u000B-\u000C\u000E-\u001F]+/g, '');
          flatText = flatText.replace(/\n/g, ' ').replace(/\r/g, '');
          
          try {
            generatedContent = JSON.parse(flatText);
            console.log(`[Attempt ${attempt}] JSON recuperado com sucesso após remover quebras de linha literais!`);
          } catch (e2) {
             if (parseError.message.includes('Unterminated string')) {
                console.warn(`[Attempt ${attempt}] Tentando fechar string não terminada...`);
                let fixedText = flatText;
                if (!fixedText.endsWith('}')) fixedText = fixedText + ']}';
                
                try {
                  generatedContent = JSON.parse(fixedText);
                  console.log(`[Attempt ${attempt}] JSON recuperado com sucesso após forçar fechamento!`);
                } catch (e3) {
                  throw parseError; 
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
