import { Context, track } from 'ripple';
import type { Tracked } from 'ripple';
import type { User, AuthState } from '../types/auth';

// Create auth context with initial state
export const AuthContext = new Context<{
  user: Tracked<User | null>;
  isAuthenticated: Tracked<boolean>;
  isLoading: Tracked<boolean>;
  error: Tracked<string | null>;
}>({
  user: track(null),
  isAuthenticated: track(false),
  isLoading: track(true),
  error: track(null),
});

/**
 * Get auth context in a component
 */
export function useAuth() {
  return AuthContext.get();
}

/**
 * Initialise auth context with default values
 */
export function createAuthContext() {
  return {
    user: track<User | null>(null),
    isAuthenticated: track(false),
    isLoading: track(true),
    error: track<string | null>(null),
  };
}

