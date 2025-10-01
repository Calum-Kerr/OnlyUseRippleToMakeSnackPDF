import { effect } from 'ripple';
import { supabase } from './supabase';
import { SubscriptionContext } from './subscription.context';
import { AuthContext } from './auth.context';
import type { Subscription } from '../types/subscription';

/**
 * Initialise subscription state management
 * Call this once when the app starts
 */
export function initSubscription() {
  const subscriptionCtx = SubscriptionContext.get();
  const authCtx = AuthContext.get();

  // Watch for auth changes and fetch subscription
  effect(() => {
    const user = @authCtx.user;
    const isAuthenticated = @authCtx.isAuthenticated;

    if (isAuthenticated && user) {
      // User is authenticated, fetch their subscription
      fetchSubscription(user.id);
    } else {
      // User is not authenticated, clear subscription
      @subscriptionCtx.subscription = null;
      @subscriptionCtx.isSubscribed = false;
      @subscriptionCtx.isLoading = false;
      @subscriptionCtx.error = null;
    }
  });
}

/**
 * Fetch subscription for a user
 */
async function fetchSubscription(userId: string) {
  const subscriptionCtx = SubscriptionContext.get();
  
  @subscriptionCtx.isLoading = true;
  @subscriptionCtx.error = null;

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // No subscription found is not an error
      if (error.code === 'PGRST116') {
        @subscriptionCtx.subscription = null;
        @subscriptionCtx.isSubscribed = false;
      } else {
        throw error;
      }
    } else if (data) {
      const subscription: Subscription = {
        id: data.id,
        userId: data.user_id,
        status: data.status,
        priceId: data.price_id,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      @subscriptionCtx.subscription = subscription;
      @subscriptionCtx.isSubscribed = isSubscriptionActive(subscription);
    }
  } catch (err) {
    console.error('Error fetching subscription:', err);
    @subscriptionCtx.error = 'Failed to load subscription status';
  } finally {
    @subscriptionCtx.isLoading = false;
  }
}

/**
 * Check if subscription is active
 */
function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  
  const activeStatuses = ['active', 'trialing'];
  return activeStatuses.includes(subscription.status);
}

/**
 * Get current subscription
 */
export function getCurrentSubscription(): Subscription | null {
  const subscriptionCtx = SubscriptionContext.get();
  return @subscriptionCtx.subscription;
}

/**
 * Check if user is subscribed
 */
export function isSubscribed(): boolean {
  const subscriptionCtx = SubscriptionContext.get();
  return @subscriptionCtx.isSubscribed;
}

/**
 * Check if subscription is loading
 */
export function isSubscriptionLoading(): boolean {
  const subscriptionCtx = SubscriptionContext.get();
  return @subscriptionCtx.isLoading;
}

/**
 * Refresh subscription data
 */
export async function refreshSubscription() {
  const authCtx = AuthContext.get();
  const user = @authCtx.user;
  
  if (user) {
    await fetchSubscription(user.id);
  }
}

/**
 * Get user's file size limit in MB
 */
export async function getUserFileSizeLimit(): Promise<number> {
  const authCtx = AuthContext.get();
  const user = @authCtx.user;

  if (!user) {
    return 1.0; // Default 1MB for non-authenticated users
  }

  try {
    const { data, error } = await supabase
      .from('user_file_limits')
      .select('max_file_size_mb, is_subscribed')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching file size limit:', error);
      return 1.0; // Default to 1MB on error
    }

    return data?.max_file_size_mb || 1.0;
  } catch (err) {
    console.error('Error fetching file size limit:', err);
    return 1.0;
  }
}

/**
 * Check if user can upload a file of given size
 */
export async function canUploadFile(fileSizeMB: number): Promise<boolean> {
  const authCtx = AuthContext.get();
  const user = @authCtx.user;

  if (!user) {
    return fileSizeMB <= 1.0; // Non-authenticated users limited to 1MB
  }

  try {
    const { data, error } = await supabase
      .rpc('can_upload_file', {
        p_user_id: user.id,
        p_file_size_mb: fileSizeMB,
      });

    if (error) {
      console.error('Error checking file upload permission:', error);
      return fileSizeMB <= 1.0; // Default to 1MB limit on error
    }

    return data === true;
  } catch (err) {
    console.error('Error checking file upload permission:', err);
    return fileSizeMB <= 1.0;
  }
}

