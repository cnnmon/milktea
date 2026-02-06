// Simple auth for local-first mobile app
// After one successful login, auth is cached locally

const AUTH_KEY = "milktea_auth";
const AUTH_TIMESTAMP_KEY = "milktea_auth_ts";
const AUTH_EMAIL_KEY = "milktea_email";
const AUTH_EXPIRY_DAYS = 30;

// The email associated with this account
const ACCOUNT_EMAIL = "tiffanywang@berkeley.edu";

export interface AuthState {
  isAuthenticated: boolean;
  timestamp: number;
  email: string;
}

// Check if locally authenticated
export function getLocalAuth(): AuthState | null {
  if (typeof window === "undefined") return null;

  const auth = localStorage.getItem(AUTH_KEY);
  const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);
  const email = localStorage.getItem(AUTH_EMAIL_KEY);

  if (!auth || !timestamp) return null;

  const ts = parseInt(timestamp, 10);
  const now = Date.now();
  const expiryMs = AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  // Check if expired
  if (now - ts > expiryMs) {
    clearLocalAuth();
    return null;
  }

  return { 
    isAuthenticated: auth === "true", 
    timestamp: ts,
    email: email || ACCOUNT_EMAIL,
  };
}

// Save auth locally after successful login
export function setLocalAuth() {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
  localStorage.setItem(AUTH_EMAIL_KEY, ACCOUNT_EMAIL);
}

// Clear local auth (logout)
export function clearLocalAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_TIMESTAMP_KEY);
  localStorage.removeItem(AUTH_EMAIL_KEY);
}

// Get the current user's email
export function getUserEmail(): string {
  if (typeof window === "undefined") return ACCOUNT_EMAIL;
  return localStorage.getItem(AUTH_EMAIL_KEY) || ACCOUNT_EMAIL;
}
