/**
 * Authentication utilities for Assixx
 */

import type { User, JWTPayload } from '../types/api.types';

import { BrowserFingerprint } from './utils/browser-fingerprint';
import SessionManager from './utils/session-manager';

// Extend window for auth functions
declare global {
  interface Window {
    getAuthToken: typeof getAuthToken;
    setAuthToken: typeof setAuthToken;
    removeAuthToken: typeof removeAuthToken;
    isAuthenticated: typeof isAuthenticated;
    fetchWithAuth: typeof fetchWithAuth;
    loadUserInfo: typeof loadUserInfo;
    logout: typeof logout;
    showSuccess: typeof showSuccess;
    showError: typeof showError;
    showInfo: typeof showInfo;
    parseJwt: typeof parseJwt;
  }
}

// Get authentication token from localStorage (compatible with existing system)
export function getAuthToken(): string | null {
  return localStorage.getItem('token') ?? localStorage.getItem('authToken');
}

// Set authentication token
export function setAuthToken(token: string): void {
  localStorage.setItem('token', token);
  localStorage.setItem('authToken', token);
}

// Remove authentication token
export function removeAuthToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('role');
  localStorage.removeItem('activeRole'); // Clear role switching state
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token || token.length === 0) {
    return false;
  }

  // Check if token is expired
  const payload = parseJwt(token);
  if (!payload?.exp) {
    return false;
  }

  // Check expiration (exp is in seconds, Date.now() is in milliseconds)
  const now = Date.now() / 1000;
  if (payload.exp < now) {
    console.info('[AUTH] Token expired, clearing auth data');
    removeAuthToken();
    return false;
  }

  return true;
}

// Parse JWT token
export function parseJwt(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

// Fetch with authentication
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();

  if (!token) {
    window.location.href = '/login';
    throw new Error('No authentication token');
  }

  // Get browser fingerprint
  const fingerprint = await BrowserFingerprint.generate();

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Browser-Fingerprint': fingerprint,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle authentication errors
  if (response.status === 401) {
    removeAuthToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  // Handle forbidden errors (wrong role)
  if (response.status === 403) {
    const userRole = localStorage.getItem('userRole');
    let redirectUrl = '/pages/login.html';

    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'employee':
        redirectUrl = '/employee-dashboard';
        break;
      case 'admin':
        redirectUrl = '/admin-dashboard';
        break;
      case 'root':
        redirectUrl = '/root-dashboard';
        break;
    }

    console.warn(`Access forbidden. Redirecting to ${redirectUrl}`);
    window.location.href = redirectUrl;
    throw new Error('Forbidden - insufficient permissions');
  }

  return response;
}

// Load user information
// Cache for user profile to prevent multiple API calls
let userProfileCache: { data: User | null; timestamp: number } = { data: null, timestamp: 0 };
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Promise cache to prevent concurrent requests
let profileLoadingPromise: Promise<User> | null = null;

export async function loadUserInfo(): Promise<User> {
  try {
    // Check if we have cached data that's still fresh
    const now = Date.now();
    if (userProfileCache.data && now - userProfileCache.timestamp < CACHE_DURATION) {
      console.info('loadUserInfo: Returning cached profile data');
      return userProfileCache.data;
    }

    // If there's already a request in progress, wait for it
    if (profileLoadingPromise) {
      console.info('loadUserInfo: Waiting for existing profile request...');
      return profileLoadingPromise;
    }

    console.info('loadUserInfo: Attempting to fetch user profile...');

    // Create the promise and store it
    profileLoadingPromise = (async () => {
      const response = await fetchWithAuth('/api/user/profile');
      console.info('loadUserInfo: Response status:', response.status);

      const data = await response.json();
      console.info('loadUserInfo: Response data:', data);

      if (response.ok) {
        // The API returns the user object directly, not wrapped in data.user
        const user: User = data.user ?? data;

        // Update user display - check both element IDs for compatibility
        const userName = document.getElementById('userName') ?? document.getElementById('user-name');
        if (userName) {
          const firstName = user.first_name ?? 'Admin';
          const lastName = user.last_name ?? '';
          userName.textContent = `${firstName} ${lastName}`.trim();
        }

        const userRole = document.getElementById('userRole');
        if (userRole) {
          userRole.textContent = user.role ?? 'Benutzer';
        }

        // Update cache with fresh data
        userProfileCache = { data: user, timestamp: Date.now() };
        console.info('loadUserInfo: Profile cached for', CACHE_DURATION / 1000, 'seconds');

        // Clear the loading promise
        profileLoadingPromise = null;
        return user;
      } else {
        // Clear the loading promise on error
        profileLoadingPromise = null;
        throw new Error(data.message ?? 'Fehler beim Laden der Benutzerdaten');
      }
    })();

    return profileLoadingPromise;
  } catch (error) {
    console.error('Error loading user info:', error);
    profileLoadingPromise = null;

    // Fallback: Set default values if API fails
    const userName = document.getElementById('userName');
    if (userName) {
      userName.textContent = 'Benutzer';
    }

    const userRole = document.getElementById('userRole');
    if (userRole) {
      userRole.textContent = localStorage.getItem('role') ?? 'Benutzer';
    }

    // Don't throw error to prevent redirect loop
    return {
      id: 0,
      username: 'Benutzer',
      email: '',
      first_name: 'Benutzer',
      role: (localStorage.getItem('role') ?? 'admin') as User['role'],
      tenant_id: 0,
      is_active: true,
      is_archived: false,
      created_at: '',
      updated_at: '',
    } as User;
  }
}

// Logout function
export async function logout(): Promise<void> {
  const token = getAuthToken();

  // Call logout API to log the action
  if (token) {
    try {
      const fingerprint = await BrowserFingerprint.generate();
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Browser-Fingerprint': fingerprint,
        },
        body: JSON.stringify({}), // Empty body to satisfy Content-Type validation
      });
    } catch (error) {
      console.error('Error logging logout:', error);
      // Continue with logout even if API call fails
    }
  }

  // Clear local storage
  removeAuthToken();
  localStorage.removeItem('userRole');
  localStorage.removeItem('activeRole');
  localStorage.removeItem('tenantId');
  localStorage.removeItem('browserFingerprint');
  localStorage.removeItem('fingerprintTimestamp');
  localStorage.removeItem('sidebarCollapsed'); // Reset sidebar state on logout

  // Clear user profile cache
  userProfileCache = { data: null, timestamp: 0 };
  profileLoadingPromise = null;

  // Redirect to login
  window.location.href = '/login';
}

// Show success message
export function showSuccess(message: string): void {
  // Simple alert for now, can be enhanced with toast notifications

  alert(`✅ ${message}`);
}

// Show error message
export function showError(message: string): void {
  // Simple alert for now, can be enhanced with toast notifications

  alert(`❌ ${message}`);
}

// Show info message
export function showInfo(message: string): void {
  // Simple alert for now, can be enhanced with toast notifications

  alert(`ℹ️ ${message}`);
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  const token = getAuthToken();
  const userRole = localStorage.getItem('userRole');
  const activeRole = localStorage.getItem('activeRole');

  console.info('[AUTH] Initialization:', {
    token: !!token,
    userRole,
    activeRole,
    path: window.location.pathname,
    isEmployeeDashboard: window.location.pathname.includes('employee-dashboard'),
  });

  // Check if user is authenticated
  if (!isAuthenticated() && !window.location.pathname.includes('login')) {
    console.info('[AUTH] No authentication token found, redirecting to login');
    window.location.href = '/login';
    return;
  }

  // Load user info if on authenticated page
  if (isAuthenticated() && !window.location.pathname.includes('login')) {
    console.info('[AUTH] Loading user info...');
    loadUserInfo().catch((error) => {
      console.error('Failed to load user info:', error);
      // Don't redirect immediately, let the user see the error
    });

    // Initialize session manager for authenticated users
    SessionManager.getInstance();
    console.info('[AUTH] Session manager initialized');

    // Enforce page access based on role - use UnifiedNavigation if available
    const unifiedNav = window.unifiedNav;
    if (unifiedNav && typeof unifiedNav.enforcePageAccess === 'function') {
      unifiedNav.enforcePageAccess();
      console.info('[AUTH] Page access enforced via UnifiedNavigation');
    } else {
      // UnifiedNavigation will handle this when it initializes
      console.info('[AUTH] Page access will be enforced by UnifiedNavigation');
    }
  }
});

// Export functions to window for backwards compatibility
if (typeof window !== 'undefined') {
  // These are already declared in global.d.ts
  window.getAuthToken = getAuthToken;
  window.setAuthToken = setAuthToken;
  window.removeAuthToken = removeAuthToken;
  window.isAuthenticated = isAuthenticated;
  window.fetchWithAuth = fetchWithAuth;
  window.loadUserInfo = loadUserInfo;
  window.logout = logout;
  window.showSuccess = showSuccess;
  window.showError = showError;
  window.showInfo = showInfo;
  window.parseJwt = parseJwt;
}
