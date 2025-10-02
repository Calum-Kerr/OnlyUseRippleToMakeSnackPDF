import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response('No signature', { status: 400 })
    }

    // Get the raw body
    const body = await req.text()

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    console.log('Received event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, stripe, supabase)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, supabase)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
        break

      case 'invoice.payment_succeeded':
        console.log('Payment succeeded for invoice:', event.data.object.id)
        break

      case 'invoice.payment_failed':
        console.log('Payment failed for invoice:', event.data.object.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  supabase: any
) {
  const userId = session.metadata?.user_id
  const subscriptionId = session.subscription as string

  if (!userId || !subscriptionId) {
    console.error('Missing user_id or subscription_id in session metadata')
    return
  }

  // Fetch full subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await upsertSubscription(userId, subscription, supabase)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, supabase: any) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('Missing user_id in subscription metadata')
    return
  }

  await upsertSubscription(userId, subscription, supabase)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('Missing user_id in subscription metadata')
    return
  }

  // Mark subscription as cancelled
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

async function upsertSubscription(
  userId: string,
  subscription: Stripe.Subscription,
  supabase: any
) {
  const subscriptionData = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'user_id',
    })

  if (error) {
    console.error('Error upserting subscription:', error)
    throw error
  }

  console.log('Successfully upserted subscription for user:', userId)
}

