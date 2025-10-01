import { effect } from 'ripple';
import { supabase } from './supabase';
import { AuthContext } from './auth.context';
import type { User } from '../types/auth';

/**
 * Initialise authentication state management
 * Call this once when the app starts
 */
export function initAuth() {
  const auth = AuthContext.get();

  // Set up auth state listener
  const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event);

    if (session?.user) {
      // User is signed in
      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name,
        avatar: session.user.user_metadata?.avatar,
        createdAt: session.user.created_at,
      };

      auth.user.value = user;
      auth.isAuthenticated.value = true;
      auth.error.value = null;
    } else {
      // User is signed out
      auth.user.value = null;
      auth.isAuthenticated.value = false;
    }

    auth.isLoading.value = false;
  });

  // Check for existing session on init
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name,
        avatar: session.user.user_metadata?.avatar,
        createdAt: session.user.created_at,
      };

      auth.user.value = user;
      auth.isAuthenticated.value = true;
    }

    auth.isLoading.value = false;
  });

  // Return cleanup function
  return () => {
    authListener.subscription.unsubscribe();
  };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  const auth = AuthContext.get();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      auth.error.value = error.message;
      return { error };
    }

    auth.user.value = null;
    auth.isAuthenticated.value = false;
    auth.error.value = null;

    return { error: null };
  } catch (err) {
    const error = err as Error;
    auth.error.value = error.message;
    return { error };
  }
}

/**
 * Get the current user
 */
export function getCurrentUser() {
  const auth = AuthContext.get();
  return auth.user.value;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const auth = AuthContext.get();
  return auth.isAuthenticated.value;
}

/**
 * Check if auth is loading
 */
export function isAuthLoading(): boolean {
  const auth = AuthContext.get();
  return auth.isLoading.value;
}

