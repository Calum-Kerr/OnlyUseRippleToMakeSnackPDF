import { track, effect } from 'ripple';
import type { Tracked } from 'ripple';

export interface Route {
  path: string;
  name: string;
  component?: any;
  meta?: {
    requiresAuth?: boolean;
    title?: string;
  };
}

export interface RouteParams {
  [key: string]: string;
}

class Router {
  private currentRoute: Tracked<string>;
  private routes: Map<string, Route>;
  private listeners: Set<(route: string) => void>;

  constructor() {
    this.currentRoute = track(this.getCurrentPath());
    this.routes = new Map();
    this.listeners = new Set();

    // Listen to browser navigation events
    window.addEventListener('popstate', () => {
      this.updateRoute(this.getCurrentPath());
    });

    // Listen to hash changes
    window.addEventListener('hashchange', () => {
      this.updateRoute(this.getCurrentPath());
    });
  }

  /**
   * Register a route
   */
  addRoute(route: Route): void {
    this.routes.set(route.path, route);
  }

  /**
   * Register multiple routes
   */
  addRoutes(routes: Route[]): void {
    routes.forEach(route => this.addRoute(route));
  }

  /**
   * Get current path from URL
   */
  private getCurrentPath(): string {
    // Use hash-based routing for simplicity
    const hash = window.location.hash.slice(1);
    return hash || '/';
  }

  /**
   * Navigate to a new route
   */
  navigate(path: string, replace: boolean = false): void {
    if (path === this.getCurrentPath()) {
      return;
    }

    if (replace) {
      window.location.replace(`#${path}`);
    } else {
      window.location.hash = path;
    }

    this.updateRoute(path);
  }

  /**
   * Go back in history
   */
  back(): void {
    window.history.back();
  }

  /**
   * Go forward in history
   */
  forward(): void {
    window.history.forward();
  }

  /**
   * Update the current route
   */
  private updateRoute(path: string): void {
    @this.currentRoute = path;
    
    // Update document title if route has meta.title
    const route = this.getRoute(path);
    if (route?.meta?.title) {
      document.title = `${route.meta.title} - SnackPDF`;
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(path));
  }

  /**
   * Get the current route as a reactive value
   */
  getRoute(path?: string): Route | undefined {
    const routePath = path || @this.currentRoute;
    
    // Try exact match first
    if (this.routes.has(routePath)) {
      return this.routes.get(routePath);
    }

    // Try pattern matching for dynamic routes
    for (const [pattern, route] of this.routes.entries()) {
      if (this.matchRoute(pattern, routePath)) {
        return route;
      }
    }

    return undefined;
  }

  /**
   * Get current route path (reactive)
   */
  getCurrentRoute(): Tracked<string> {
    return this.currentRoute;
  }

  /**
   * Check if a route matches a pattern
   */
  private matchRoute(pattern: string, path: string): boolean {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) {
      return false;
    }

    return patternParts.every((part, i) => {
      return part.startsWith(':') || part === pathParts[i];
    });
  }

  /**
   * Extract params from a dynamic route
   */
  getParams(pattern: string, path: string): RouteParams {
    const params: RouteParams = {};
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    patternParts.forEach((part, i) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);
        params[paramName] = pathParts[i];
      }
    });

    return params;
  }

  /**
   * Subscribe to route changes
   */
  onRouteChange(callback: (route: string) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Check if current route matches a path
   */
  isActive(path: string): boolean {
    return @this.currentRoute === path;
  }

  /**
   * Check if current route starts with a path (for nested routes)
   */
  isActivePrefix(prefix: string): boolean {
    return @this.currentRoute.startsWith(prefix);
  }
}

// Create singleton instance
export const router = new Router();

// Helper function to use in components
export function useRouter() {
  return router;
}

// Helper to get current route reactively
export function useCurrentRoute(): Tracked<string> {
  return router.getCurrentRoute();
}

// Helper to check if route is active
export function useIsActive(path: string): boolean {
  return router.isActive(path);
}

