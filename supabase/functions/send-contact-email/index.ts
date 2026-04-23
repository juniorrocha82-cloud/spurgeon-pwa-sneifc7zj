import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!RESEND_API_KEY) {
      throw new Error('A chave da API do Resend não está configurada no Supabase Secrets.');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Chaves do Supabase ausentes no ambiente.');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { to, subject, html, name, email, message } = payload;

    let finalTo = to;
    let finalSubject = subject;
    let finalHtml = html;
    let replyTo = undefined;

    // Suporte para o formulário de contato legado
    if (!finalTo && email && message) {
      finalTo = 'faleconosco@spurgeon.one';
      finalSubject = `Novo Contato via Site: ${subject || 'Sem assunto'}`;
      replyTo = email;
      finalHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #d97706;">Nova mensagem de contato recebida</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Assunto:</strong> ${subject}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Mensagem:</strong></p>
          <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
      `;
    }

    if (!finalTo || !finalSubject || !finalHtml) {
      throw new Error('Parâmetros "to", "subject" e "html" são obrigatórios.');
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Spurgeon PWA <faleconosco@spurgeon.one>',
        to: finalTo,
        reply_to: replyTo,
        subject: finalSubject,
        html: finalHtml
      }),
    });

    let status = 'sent';
    let errorMsg = null;

    if (!res.ok) {
      status = 'failed';
      errorMsg = await res.text();
    }

    // Registrar tentativa no banco de dados
    await supabase.from('email_logs').insert({
      to_email: typeof finalTo === 'string' ? finalTo : JSON.stringify(finalTo),
      subject: finalSubject,
      status: status,
      error_message: errorMsg
    });

    if (status === 'failed') {
      throw new Error(`Erro na API do Resend: ${errorMsg}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Erro ao enviar e-mail:', error.message);
    
    // Tenta registrar o erro de execução na tabela de logs se possível
    try {
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const payload = await req.clone().json().catch(() => ({}));
        await supabase.from('email_logs').insert({
          to_email: payload.to || payload.email || 'unknown',
          subject: payload.subject || 'Error before sending',
          status: 'failed',
          error_message: error.message
        });
      }
    } catch (e) {
      // Ignora falhas de log secundárias
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
