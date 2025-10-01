import { Context, track } from 'ripple';
import type { Tracked } from 'ripple';
import type { Subscription, SubscriptionStatus } from '../types/subscription';

// Create subscription context with initial state
export const SubscriptionContext = new Context<{
  subscription: Tracked<Subscription | null>;
  isSubscribed: Tracked<boolean>;
  isLoading: Tracked<boolean>;
  error: Tracked<string | null>;
}>({
  subscription: track(null),
  isSubscribed: track(false),
  isLoading: track(true),
  error: track(null),
});

/**
 * Get subscription context in a component
 */
export function useSubscription() {
  return SubscriptionContext.get();
}

/**
 * Initialise subscription context with default values
 */
export function createSubscriptionContext() {
  return {
    subscription: track<Subscription | null>(null),
    isSubscribed: track(false),
    isLoading: track(true),
    error: track<string | null>(null),
  };
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(status: SubscriptionStatus | undefined): boolean {
  return status === 'active' || status === 'trialing';
}

