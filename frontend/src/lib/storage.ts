const STORAGE_KEY = 'compssa_auth';

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  role: string;
}

export function getStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getPendingEmail(): string | null {
  return sessionStorage.getItem('pending_email');
}

export function setPendingEmail(email: string): void {
  sessionStorage.setItem('pending_email', email);
}

export function clearPendingEmail(): void {
  sessionStorage.removeItem('pending_email');
}
