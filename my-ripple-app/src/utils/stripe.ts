import { loadStripe, Stripe } from '@stripe/stripe-js';

// Get environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePriceId = import.meta.env.VITE_STRIPE_PRICE_ID;

// Validate environment variables
if (!stripePublishableKey) {
  console.warn('Missing Stripe publishable key. Stripe functionality will be disabled.');
}

if (!stripePriceId) {
  console.warn('Missing Stripe price ID. Subscription functionality will be disabled.');
}

// Stripe instance (lazy loaded)
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance (lazy loaded)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise || Promise.resolve(null);
}

/**
 * Get the Stripe price ID for SnackPDF Pro subscription
 */
export function getStripePriceId(): string | undefined {
  return stripePriceId;
}

/**
 * Format amount in pence to pounds
 */
export function formatStripeAmount(amountInPence: number): string {
  const pounds = amountInPence / 100;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pounds);
}

