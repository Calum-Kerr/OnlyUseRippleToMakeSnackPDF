# Stripe Webhook Implementation Guide

This document explains how to implement Stripe webhooks for SnackPDF to handle subscription events.

## Overview

Stripe webhooks notify your application when subscription events occur (e.g., payment succeeded, subscription cancelled). Since SnackPDF is a client-side application, you need a backend endpoint to securely handle these webhooks.

## Required Webhook Events

Your webhook endpoint must handle these events:

1. **`checkout.session.completed`** - When a user completes checkout
2. **`customer.subscription.created`** - When a subscription is created
3. **`customer.subscription.updated`** - When a subscription is updated
4. **`customer.subscription.deleted`** - When a subscription is cancelled
5. **`invoice.payment_succeeded`** - When a payment succeeds
6. **`invoice.payment_failed`** - When a payment fails

## Implementation Options

### Option 1: Supabase Edge Functions (Recommended)

Supabase Edge Functions are serverless functions that run on Deno Deploy. They're perfect for handling webhooks.

#### Step 1: Create Edge Function

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Create a new edge function
supabase functions new stripe-webhook
```

#### Step 2: Implement Webhook Handler

Create `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('Received event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded for invoice:', invoice.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', invoice.id)
        // TODO: Send email notification to user
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const subscriptionId = session.subscription as string

  if (!userId || !subscriptionId) {
    console.error('Missing user_id or subscription_id in session metadata')
    return
  }

  // Fetch full subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await upsertSubscription(userId, subscription)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('Missing user_id in subscription metadata')
    return
  }

  await upsertSubscription(userId, subscription)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('Missing user_id in subscription metadata')
    return
  }

  // Delete subscription from database
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', subscription.id)

  if (error) {
    console.error('Error deleting subscription:', error)
  } else {
    console.log('Subscription deleted:', subscription.id)
  }
}

async function upsertSubscription(userId: string, subscription: Stripe.Subscription) {
  const subscriptionData = {
    id: subscription.id,
    user_id: userId,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, { onConflict: 'id' })

  if (error) {
    console.error('Error upserting subscription:', error)
  } else {
    console.log('Subscription upserted:', subscription.id)
  }
}
```

#### Step 3: Set Environment Variables

```bash
# Set secrets for the edge function
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### Step 4: Deploy Edge Function

```bash
supabase functions deploy stripe-webhook
```

Your webhook URL will be:
```
https://your-project-ref.supabase.co/functions/v1/stripe-webhook
```

### Option 2: Vercel/Netlify Serverless Functions

If you're deploying to Vercel or Netlify, you can use their serverless functions.

#### Vercel Example (`api/webhooks/stripe.ts`):

```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const signature = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  // ... (similar implementation as Supabase Edge Function)
}
```

## Creating Checkout Sessions

You also need a backend endpoint to create checkout sessions. Here's an example:

### Supabase Edge Function: `create-checkout-session`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { priceId, userId, userEmail } = await req.json()

    if (!priceId || !userId || !userEmail) {
      return new Response('Missing required fields', { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/#/subscription/success`,
      cancel_url: `${req.headers.get('origin')}/#/subscription`,
      customer_email: userEmail,
      metadata: {
        user_id: userId,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
    })

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Error creating checkout session:', err)
    return new Response(`Error: ${err.message}`, { status: 500 })
  }
})
```

## Testing Webhooks Locally

Use the Stripe CLI to forward webhooks to your local development server:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

## Security Checklist

- ✅ Always verify webhook signatures
- ✅ Use HTTPS for webhook endpoints
- ✅ Store Stripe secret key securely (environment variables)
- ✅ Use Supabase service role key for database operations
- ✅ Validate all incoming data
- ✅ Log all webhook events for debugging
- ✅ Handle errors gracefully
- ✅ Return 200 status to acknowledge receipt

## Updating Your Ripple App

Once your webhook endpoint is deployed, update `SubscriptionButton.ripple`:

```typescript
const response = await fetch('https://your-project-ref.supabase.co/functions/v1/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId,
    userId: @auth.user.id,
    userEmail: @auth.user.email,
  }),
});

const { sessionId } = await response.json();
await stripe.redirectToCheckout({ sessionId });
```

## Monitoring

Monitor your webhooks in the Stripe Dashboard:
1. Go to **Developers** > **Webhooks**
2. Click on your webhook endpoint
3. View event logs and delivery attempts

## Troubleshooting

**Webhook not receiving events:**
- Check webhook URL is correct in Stripe Dashboard
- Verify webhook signing secret matches
- Check function logs for errors

**Signature verification fails:**
- Ensure you're using raw request body (not parsed JSON)
- Check webhook secret is correct
- Verify Stripe API version matches

**Database updates not working:**
- Check Supabase service role key is set
- Verify RLS policies allow service role access
- Check function logs for database errors

