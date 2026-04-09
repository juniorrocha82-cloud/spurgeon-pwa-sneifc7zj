import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@^14.0.0'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    console.error('No signature provided')
    return new Response(JSON.stringify({ error: 'No signature provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    let event

    if (webhookSecret) {
      console.log('Constructing webhook event...')
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider,
      )
    } else {
      console.log('No webhook secret, parsing body directly...')
      event = JSON.parse(body)
    }

    console.log(`Processing event type: ${event.type}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      console.log(`Checkout session completed: ${session.id}`)

      const userId = session.client_reference_id || session.metadata?.user_id
      const stripeSubscriptionId = session.subscription as string

      if (userId) {
        console.log(`Processing user: ${userId}`)

        let planId = session.metadata?.plan_id

        if (!planId) {
          try {
            const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
              expand: ['line_items'],
            })
            planId = sessionWithLineItems.line_items?.data[0]?.price?.id as string
          } catch (e) {
            console.error('Error fetching line_items:', e)
          }
        }

        if (!planId) {
          planId = 'pro' // Default fallback
        }

        let internalPlanId = planId
        const { data: planData } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('price_id', planId)
          .maybeSingle()

        if (planData) {
          internalPlanId = planData.id
        }

        // Default expires at (30 days)
        let expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)
        let status = 'active'

        if (stripeSubscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
            expiresAt = new Date(sub.current_period_end * 1000)
            status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : sub.status
            console.log(
              `Retrieved subscription ${stripeSubscriptionId}, status: ${status}, expires: ${expiresAt}`,
            )
          } catch (e) {
            console.error('Error fetching subscription from Stripe:', e)
          }
        }

        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle()

        if (existingSub) {
          console.log(`Updating existing subscription for user: ${userId}`)
          await supabase
            .from('user_subscriptions')
            .update({
              status: status,
              plan_id: internalPlanId,
              expires_at: expiresAt.toISOString(),
              stripe_subscription_id: stripeSubscriptionId || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSub.id)
        } else {
          console.log(`Creating new subscription for user: ${userId}`)
          await supabase.from('user_subscriptions').insert({
            user_id: userId,
            status: status,
            plan_id: internalPlanId,
            expires_at: expiresAt.toISOString(),
            stripe_subscription_id: stripeSubscriptionId || null,
          })
        }
      } else {
        console.warn('No user_id found in session client_reference_id or metadata')
      }
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      console.log(`Subscription updated: ${subscription.id}`)

      const stripeSubscriptionId = subscription.id
      const status =
        subscription.status === 'active' || subscription.status === 'trialing'
          ? 'active'
          : subscription.status
      const expiresAt = new Date(subscription.current_period_end * 1000).toISOString()
      const priceId = subscription.items.data[0].price.id

      let internalPlanId = 'pro'
      const { data: planData } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('price_id', priceId)
        .maybeSingle()

      if (planData) {
        internalPlanId = planData.id
      }

      console.log(
        `Updating DB for subscription ${stripeSubscriptionId} to plan ${internalPlanId}, status ${status}`,
      )

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: status,
          plan_id: internalPlanId,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', stripeSubscriptionId)

      if (error) {
        console.error('Error updating subscription in database:', error)
      } else {
        console.log('Subscription updated successfully in database')
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      console.log(`Subscription deleted: ${subscription.id}`)

      const stripeSubscriptionId = subscription.id

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'canceled',
          plan_id: 'free',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', stripeSubscriptionId)

      if (error) {
        console.error('Error updating canceled subscription in database:', error)
      } else {
        console.log('Subscription marked as canceled in database')
      }
    } else {
      console.log(`Unhandled event type: ${event.type}`)
    }

    console.log('Webhook processed successfully')
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
