import type { Component } from 'ripple';

export interface Route {
  path: string;
  component: () => Promise<{ [key: string]: Component }>;
  title: string;
  requiresAuth?: boolean;
  breadcrumb?: string;
}

export const routes: Route[] = [
  {
    path: '/',
    component: () => import('../pages/Dashboard.ripple'),
    title: 'Dashboard - SnackPDF',
    requiresAuth: true,
    breadcrumb: 'Dashboard',
  },
  {
    path: '/organise',
    component: () => import('../pages/Organise.ripple'),
    title: 'Organise PDFs - SnackPDF',
    requiresAuth: true,
    breadcrumb: 'Organise',
  },
  {
    path: '/convert-to-pdf',
    component: () => import('../pages/ConvertToPDF.ripple'),
    title: 'Convert to PDF - SnackPDF',
    requiresAuth: true,
    breadcrumb: 'Convert to PDF',
  },
  {
    path: '/convert-from-pdf',
    component: () => import('../pages/ConvertFromPDF.ripple'),
    title: 'Convert from PDF - SnackPDF',
    requiresAuth: true,
    breadcrumb: 'Convert from PDF',
  },
  {
    path: '/sign-security',
    component: () => import('../pages/SignAndSecurity.ripple'),
    title: 'Sign and Security - SnackPDF',
    requiresAuth: true,
    breadcrumb: 'Sign and Security',
  },
  {
    path: '/view-edit',
    component: () => import('../pages/ViewAndEdit.ripple'),
    title: 'View and Edit - SnackPDF',
    requiresAuth: true,
    breadcrumb: 'View and Edit',
  },
  {
    path: '/advanced',
    component: () => import('../pages/Advanced.ripple'),
    title: 'Advanced Tools - SnackPDF',
    requiresAuth: true,
    breadcrumb: 'Advanced',
  },
  {
    path: '/auth/signin',
    component: () => import('../components/Auth/SignIn.ripple'),
    title: 'Sign In - SnackPDF',
    requiresAuth: false,
    breadcrumb: 'Sign In',
  },
  {
    path: '/auth/signup',
    component: () => import('../components/Auth/SignUp.ripple'),
    title: 'Sign Up - SnackPDF',
    requiresAuth: false,
    breadcrumb: 'Sign Up',
  },
  {
    path: '/auth/forgot-password',
    component: () => import('../components/Auth/ForgotPassword.ripple'),
    title: 'Forgot Password - SnackPDF',
    requiresAuth: false,
    breadcrumb: 'Forgot Password',
  },
  {
    path: '/auth/reset-password',
    component: () => import('../components/Auth/ResetPassword.ripple'),
    title: 'Reset Password - SnackPDF',
    requiresAuth: false,
    breadcrumb: 'Reset Password',
  },
  {
    path: '/subscription',
    component: () => import('../pages/Dashboard.ripple'), // Reuse Dashboard for now
    title: 'Subscription - SnackPDF',
    requiresAuth: true,
    breadcrumb: 'Subscription',
  },
  {
    path: '/privacy-policy',
    component: () => import('../pages/Dashboard.ripple'), // Placeholder
    title: 'Privacy Policy - SnackPDF',
    requiresAuth: false,
    breadcrumb: 'Privacy Policy',
  },
  {
    path: '/terms-conditions',
    component: () => import('../pages/Dashboard.ripple'), // Placeholder
    title: 'Terms & Conditions - SnackPDF',
    requiresAuth: false,
    breadcrumb: 'Terms & Conditions',
  },
  {
    path: '/cookie-policy',
    component: () => import('../pages/Dashboard.ripple'), // Placeholder
    title: 'Cookie Policy - SnackPDF',
    requiresAuth: false,
    breadcrumb: 'Cookie Policy',
  },
  {
    path: '/data-protection',
    component: () => import('../pages/Dashboard.ripple'), // Placeholder
    title: 'Data Protection - SnackPDF',
    requiresAuth: false,
    breadcrumb: 'Data Protection',
  },
];

/**
 * Find route by path
 */
export function findRoute(path: string): Route | undefined {
  return routes.find((route) => route.path === path);
}

/**
 * Get breadcrumb trail for a path
 */
export function getBreadcrumbs(path: string): Array<{ label: string; path: string }> {
  const breadcrumbs: Array<{ label: string; path: string }> = [
    { label: 'Dashboard', path: '/' },
  ];

  if (path === '/') {
    return breadcrumbs;
  }

  const route = findRoute(path);
  if (route && route.breadcrumb) {
    breadcrumbs.push({ label: route.breadcrumb, path });
  }

  return breadcrumbs;
}

/**
 * Check if route requires authentication
 */
export function requiresAuth(path: string): boolean {
  const route = findRoute(path);
  return route?.requiresAuth ?? false;
}

