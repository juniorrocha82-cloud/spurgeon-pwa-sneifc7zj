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
          error:
            "API Key do Gemini não encontrada. Por favor, configure a secret 'GEMINI_API_KEY' no painel do Supabase Edge Functions.",
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const systemPrompt = `Você é um teólogo, pastor e escritor cristão extremamente experiente e inspirador.
Sua tarefa é gerar um devocional diário com profundidade teológica, rigor bíblico e aplicação prática contundente. O texto total deve ter entre 800 e 1000 palavras.

Escolha aleatoriamente um texto bíblico edificante e rico para o devocional de hoje.

Responda OBRIGATORIAMENTE em formato JSON válido com a seguinte estrutura exata:
{
  "title": "Um título chamativo e reflexivo para o devocional",
  "baseText": "Referência Bíblica (ex: Salmos 23:1-3)",
  "reading": "O texto bíblico completo da referência, seguido OBRIGATORIAMENTE por uma explicação detalhada e rica sobre o contexto histórico e cultural da passagem. NUNCA use quebras de linha literais; use o escape '\\n\\n' para separar os parágrafos.",
  "reflection": "Uma análise teológica profunda (2 a 3 parágrafos robustos), seguida de uma aplicação prática detalhada para a vida moderna, conexões com outros versículos bíblicos relevantes e insights espirituais transformadores. NUNCA use quebras de linha literais; use o escape '\\n\\n' para separar os parágrafos.",
  "prayer": "Uma oração final extensa, personalizada, profunda e não genérica, que reflita intensamente a mensagem abordada no devocional."
}

IMPORTANTE: A resposta deve ser um JSON perfeitamente válido. Não inclua quebras de linha literais (Enter) dentro dos valores das strings do JSON. Em vez disso, use sempre a sequência de escape '\\n'. Escape também eventuais aspas duplas internas com '\\"'.`

    const userPrompt = 'Gere o devocional diário de hoje com profundidade teológica, contexto histórico, aplicações modernas e no mínimo 800 a 1000 palavras.'

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
            maxOutputTokens: 3000,
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
    
    // (6) Adicione logs mostrando o JSON gerado antes de retornar
    console.log("=== RAW JSON FROM AI ===");
    console.log(responseText);
    console.log("========================");

    // Limpeza de blocos markdown e formatação indesejada
    let cleanText = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

    // Tentativa de sanitização conforme solicitado
    // (3) Escape correto de barras invertidas (evita escapar o que já é escape válido)
    cleanText = cleanText.replace(/\\(?![nrt"\\/bfu])/g, '\\\\');

    // Remove caracteres de controle que podem quebrar o parse do JSON (exceto newlines que são válidos na estrutura)
    cleanText = cleanText.replace(/[\u0000-\u0009\u000B-\u000C\u000E-\u001F]+/g, '')

    let generatedContent;
    try {
      // (4) Validação do JSON antes de retornar usando parse e stringify
      generatedContent = JSON.parse(cleanText);
      const finalString = JSON.stringify(generatedContent);
      JSON.parse(finalString);
      
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError.message);
      console.error('Malformed JSON Content:', cleanText);
      
      // (5) Se houver erro, retorne erro 400 com mensagem clara
      return new Response(
        JSON.stringify({ 
          error: "O conteúdo gerado pela IA apresentou um formato inválido (JSON malformado). Por favor, tente novamente.",
          details: parseError.message
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(JSON.stringify(generatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error("Internal Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno no servidor' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
