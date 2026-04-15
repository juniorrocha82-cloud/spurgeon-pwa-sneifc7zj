import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@^14.0.0'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createCryptoProvider()

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return new Response('No signature provided', { status: 400 })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    let event

    if (webhookSecret) {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider,
      )
    } else {
      event = JSON.parse(body)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id || session.metadata?.user_id
      const stripeSubscriptionId = session.subscription

      if (userId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Configurar para 7 dias a partir de agora
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        let planId = session.metadata?.plan_id

        if (!planId) {
          try {
            const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
              expand: ['line_items'],
            })
            planId = sessionWithLineItems.line_items?.data[0]?.price?.id as string
          } catch (e) {
            console.error('Erro ao buscar line_items:', e)
          }
        }

        if (!planId) {
          planId = 'pro' // Default fallback
        }

        // Tenta buscar o ID interno do plano correspondente ao price_id do Stripe
        let internalPlanId = planId
        const { data: planData } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('price_id', planId)
          .maybeSingle()

        if (planData) {
          internalPlanId = planData.id
        }

        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle()

        if (existingSub) {
          await supabase
            .from('user_subscriptions')
            .update({
              status: 'active',
              plan_id: internalPlanId,
              expires_at: expiresAt.toISOString(),
              stripe_subscription_id: (stripeSubscriptionId as string) || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSub.id)
        } else {
          await supabase.from('user_subscriptions').insert({
            user_id: userId,
            status: 'active',
            plan_id: internalPlanId,
            expires_at: expiresAt.toISOString(),
            stripe_subscription_id: (stripeSubscriptionId as string) || null,
          })
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
