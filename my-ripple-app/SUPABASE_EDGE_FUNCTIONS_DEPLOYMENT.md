# Supabase Edge Functions Deployment Guide

This guide explains how to deploy the Stripe integration Edge Functions to Supabase.

## Prerequisites

1. **Supabase CLI installed**:
   ```bash
   npm install -g supabase
   ```

2. **Supabase project created** (you already have this)

3. **Stripe account** with:
   - Secret Key (starts with `sk_`)
   - Webhook Secret (starts with `whsec_`)
   - Price ID for £1/month subscription

## Step 1: Link Your Supabase Project

```bash
cd my-ripple-app
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

To find your project ref:
- Go to https://supabase.com/dashboard
- Select your project
- Go to Settings > General
- Copy the "Reference ID"

## Step 2: Set Environment Variables

Set the required secrets for your Edge Functions:

```bash
# Set Stripe Secret Key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Set Stripe Webhook Secret (you'll get this after deploying the webhook function)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase URL and Service Role Key are automatically available
```

## Step 3: Deploy Edge Functions

Deploy all three Edge Functions:

```bash
# Deploy create-checkout-session function
supabase functions deploy create-checkout-session

# Deploy create-portal-session function
supabase functions deploy create-portal-session

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook
```

## Step 4: Run Database Migration

Apply the database migration to add Stripe fields:

```bash
supabase db push
```

Or manually run the SQL in Supabase Dashboard:
1. Go to SQL Editor
2. Copy the contents of `supabase/migrations/20250102_add_stripe_fields.sql`
3. Run the SQL

## Step 5: Configure Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter the webhook URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Update the secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

## Step 6: Enable Stripe Customer Portal

1. Go to Stripe Dashboard > Settings > Billing > Customer portal
2. Click "Activate test link" (for test mode) or "Activate" (for live mode)
3. Configure the portal settings:
   - Allow customers to update payment methods: ✓
   - Allow customers to cancel subscriptions: ✓
   - Allow customers to switch plans: (optional)

## Step 7: Test the Integration

1. Sign in to your app
2. Click "Subscribe for £1/month"
3. Complete the checkout with a test card: `4242 4242 4242 4242`
4. Verify the subscription appears in your Dashboard
5. Try accessing the Customer Portal to update payment method

## Troubleshooting

### Function not found
- Make sure you've deployed the functions: `supabase functions list`
- Check the function logs: `supabase functions logs create-checkout-session`

### Webhook not receiving events
- Verify the webhook URL is correct
- Check the webhook secret is set correctly
- View webhook logs in Stripe Dashboard > Developers > Webhooks > [Your webhook] > Events

### CORS errors
- The Edge Functions include CORS headers for all origins (`*`)
- If you need to restrict origins, update the `corsHeaders` in each function

### Environment variables not set
- List all secrets: `supabase secrets list`
- Set missing secrets: `supabase secrets set KEY=value`

## Function URLs

After deployment, your functions will be available at:

- **Create Checkout Session**: 
  `https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-checkout-session`

- **Create Portal Session**: 
  `https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-portal-session`

- **Stripe Webhook**: 
  `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`

## Local Development

To test Edge Functions locally:

```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/create-checkout-session' \
  --header 'Content-Type: application/json' \
  --data '{"priceId":"price_xxx","userId":"user_xxx","userEmail":"test@example.com"}'
```

## Next Steps

1. Test the complete subscription flow
2. Switch to live mode Stripe keys when ready for production
3. Update webhook endpoint to use live mode
4. Monitor function logs and Stripe events

