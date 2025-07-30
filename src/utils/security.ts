// Rate limiting utility for client-side protection
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  isRateLimited(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (attempt.count >= maxAttempts) {
      return true;
    }

    attempt.count++;
    return false;
  }

  getRemainingTime(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return 0;
    
    return Math.max(0, attempt.resetTime - Date.now());
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// CSRF token generation and validation - FIXED SECURITY VULNERABILITY
export function generateCSRFToken(): string {
  // Use cryptographically secure random generation instead of Math.random()
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function setCSRFToken(): string {
  const token = generateCSRFToken();
  sessionStorage.setItem('csrf_token', token);
  return token;
}

export function getCSRFToken(): string | null {
  return sessionStorage.getItem('csrf_token');
}

export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  return storedToken === token;
}

// Clean up auth state utility
export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .trim();
}

// Password strength checker
export function getPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Use pelo menos 8 caracteres');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Inclua letras minúsculas');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Inclua letras maiúsculas');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Inclua números');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Inclua caracteres especiais');

  // Bonus points for length
  if (password.length >= 12) score += 1;

  return { score, feedback };
}

// Secure random string generator
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}