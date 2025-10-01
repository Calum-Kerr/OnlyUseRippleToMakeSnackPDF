# Stripe Setup Guide for SnackPDF

## 1. Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" or "Sign in"
3. Create an account or sign in
4. Complete the account setup process

## 2. Enable Test Mode

1. In the Stripe Dashboard, ensure you're in **Test Mode** (toggle in the top right)
2. You'll use test mode for development and testing

## 3. Create Subscription Product

1. Go to **Products** in the left sidebar
2. Click **+ Add product**
3. Fill in the product details:
   - **Name**: SnackPDF Pro
   - **Description**: Unlimited PDF file size uploads for SnackPDF
   - **Pricing model**: Standard pricing
   - **Price**: £1.00 GBP
   - **Billing period**: Monthly (Recurring)
4. Click **Add product**
5. **Copy the Price ID** (starts with `price_`) - you'll need this later

## 4. Get API Keys

1. Go to **Developers** > **API keys**
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`) - safe to use in browser
   - **Secret key** (starts with `sk_test_`) - keep this secure, server-side only
3. Copy the **Publishable key**
4. Add it to your `.env` file:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

**Note**: The secret key will be used for webhook handling (backend/serverless function)

## 5. Configure Webhook Endpoints (For Production)

Webhooks allow Stripe to notify your application when subscription events occur.

### Development (Local Testing with Stripe CLI):

1. Install Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Run: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to http://localhost:5173/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_`)

### Production:

1. Go to **Developers** > **Webhooks**
2. Click **+ Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

## 6. Create Checkout Session (Implementation Overview)

Since this is a client-side only app, you'll need a serverless function or backend to create checkout sessions securely. Here are your options:

### Option A: Supabase Edge Functions (Recommended)

1. Create a Supabase Edge Function to handle checkout session creation
2. The function will use your Stripe secret key
3. Your Ripple app calls this function to create checkout sessions

### Option B: Vercel/Netlify Serverless Functions

1. Deploy serverless functions alongside your static site
2. Functions handle Stripe API calls securely

### Option C: Separate Backend API

1. Create a simple Node.js/Express backend
2. Deploy it separately (e.g., Railway, Render, Fly.io)

## 7. Webhook Handler Implementation

You'll need a backend endpoint to handle Stripe webhooks. This endpoint will:

1. Verify the webhook signature
2. Handle subscription events
3. Update the `subscriptions` table in Supabase

Example events to handle:
- `checkout.session.completed`: Create subscription record
- `customer.subscription.updated`: Update subscription status
- `customer.subscription.deleted`: Mark subscription as cancelled

## 8. Test Cards

Use these test card numbers in test mode:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |
| 4000 0000 0000 9995 | Declined (insufficient funds) |

- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC
- Use any postal code

## 9. Customer Portal (Optional)

Enable the Customer Portal so users can manage their subscriptions:

1. Go to **Settings** > **Billing** > **Customer portal**
2. Click **Activate test link** (for test mode)
3. Configure what customers can do:
   - ✅ Cancel subscriptions
   - ✅ Update payment methods
   - ✅ View invoices
4. Save settings

## 10. Production Checklist

Before going live:

1. ✅ Switch to **Live Mode** in Stripe Dashboard
2. ✅ Create the product again in Live Mode (test products don't transfer)
3. ✅ Get Live API keys (start with `pk_live_` and `sk_live_`)
4. ✅ Update `.env` with live keys
5. ✅ Configure live webhook endpoints
6. ✅ Complete Stripe account activation (business details, bank account)
7. ✅ Test the entire flow with real payment methods
8. ✅ Set up proper error monitoring

## 11. Important Notes

### Security:
- **NEVER** expose your secret key in client-side code
- **ALWAYS** create checkout sessions server-side
- **ALWAYS** verify webhook signatures
- Use environment variables for all keys

### Pricing:
- Stripe charges 1.5% + 20p per successful transaction in the UK
- For a £1 subscription, you'll receive approximately £0.78 per month per user

### Testing:
- Always test the complete flow in test mode first
- Test successful payments, failed payments, and cancellations
- Test webhook handling thoroughly

## 12. Useful Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

## Next Steps

1. Set up a serverless function or backend for checkout session creation
2. Implement webhook handler to update Supabase
3. Integrate Stripe Checkout in your Ripple components
4. Test the complete subscription flow

