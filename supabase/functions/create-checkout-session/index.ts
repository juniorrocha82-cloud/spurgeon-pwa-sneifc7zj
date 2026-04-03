import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@^14.0.0'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Preflight CORS handler
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')

    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY não encontrada no ambiente.')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const body = await req.json()
    const { plan_id, user_id } = body

    if (!plan_id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Os parâmetros plan_id e user_id são obrigatórios.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Capture the origin from headers to properly construct the redirect URLs
    const origin = req.headers.get('origin') || 'https://spurgeon.one'

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/success?canceled=true`,
      client_reference_id: user_id,
      metadata: {
        user_id: user_id,
        plan_id: plan_id,
      },
    })

    if (!session.url) {
      throw new Error('Falha ao gerar a URL de checkout do Stripe.')
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Erro na criação do checkout:', error.message)
    return new Response(JSON.stringify({ error: error.message || 'Erro interno no servidor.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
