
// Enhanced security utilities building on the existing security.ts

import { rateLimiter } from './security';
import { securityLogger } from '@/components/Security/SecurityEventLogger';

// Enhanced rate limiting with security logging
export class EnhancedRateLimiter {
  static async checkWithLogging(
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000,
    eventType: string = 'rate_limit_check'
  ): Promise<boolean> {
    const isLimited = rateLimiter.isRateLimited(key, maxAttempts, windowMs);
    
    if (isLimited) {
      await securityLogger.logEvent(
        'rate_limit_exceeded',
        'medium',
        {
          key: key.replace(/sensitive|password|token/gi, '[REDACTED]'),
          max_attempts: maxAttempts,
          window_ms: windowMs,
          remaining_time: rateLimiter.getRemainingTime(key)
        }
      );
    }
    
    return !isLimited;
  }

  static async logAttempt(key: string, eventType: string, metadata: Record<string, any> = {}) {
    await securityLogger.logEvent(
      eventType,
      'low',
      {
        key: key.replace(/sensitive|password|token/gi, '[REDACTED]'),
        ...metadata
      }
    );
  }
}

// Security headers management
export const SecurityHeaders = {
  // Content Security Policy with Google Fonts support
  getCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "style-src-elem 'self' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  },

  // Security headers for API responses
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': this.getCSPHeader(),
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };
  }
};

// Input validation enhancements
export const SecureInput = {
  // Validate and sanitize file uploads
  validateFileUpload(file: File, allowedTypes: string[], maxSizeBytes: number): {
    isValid: boolean;
    error?: string;
    sanitizedName?: string;
  } {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      securityLogger.logEvent(
        'invalid_file_upload_attempt',
        'medium',
        { file_type: file.type, file_name: file.name }
      );
      return { isValid: false, error: 'Tipo de arquivo não permitido' };
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      securityLogger.logEvent(
        'oversized_file_upload_attempt',
        'medium',
        { file_size: file.size, max_size: maxSizeBytes }
      );
      return { isValid: false, error: 'Arquivo muito grande' };
    }

    // Sanitize filename
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 100);

    return { isValid: true, sanitizedName };
  },

  // Enhanced URL validation
  validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Block dangerous protocols
      const allowedProtocols = ['http:', 'https:'];
      if (!allowedProtocols.includes(urlObj.protocol)) {
        securityLogger.logEvent(
          'dangerous_protocol_attempt',
          'high',
          { url: url.substring(0, 100), protocol: urlObj.protocol }
        );
        return false;
      }

      // Block local/private IPs (basic check)
      const hostname = urlObj.hostname;
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')
      ) {
        securityLogger.logEvent(
          'local_ip_access_attempt',
          'high',
          { hostname }
        );
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
};

// Session security enhancements
export const SessionSecurity = {
  // Check session validity and log suspicious activity
  async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await (await import('@/integrations/supabase/client')).supabase.auth.getSession();
      
      if (error || !session) {
        await securityLogger.logEvent('invalid_session_access', 'medium');
        return false;
      }

      // Check if session is close to expiry
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeToExpiry = expiresAt - now;

      if (timeToExpiry < 300) { // 5 minutes
        await securityLogger.logEvent(
          'session_near_expiry',
          'low',
          { time_to_expiry: timeToExpiry }
        );
      }

      return true;
    } catch (error) {
      await securityLogger.logEvent(
        'session_validation_error',
        'medium',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return false;
    }
  },

  // Log concurrent session detection
  async detectConcurrentSessions(userId: string) {
    await securityLogger.logEvent(
      'concurrent_session_detected',
      'medium',
      { user_id: userId, timestamp: Date.now() }
    );
  }
};

// Data sanitization with security logging
export const SecureDataHandler = {
  // Sanitize data with logging for suspicious content
  sanitizeWithLogging(input: string, context: string = 'unknown'): string {
    const original = input;
    
    // Check for common attack patterns
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /on\w+\s*=/gi, // Event handlers
      /expression\s*\(/gi, // CSS expressions
      /import\s*\(/gi, // Dynamic imports
      /eval\s*\(/gi // Eval calls
    ];

    let sanitized = input;
    let suspiciousContentFound = false;

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        suspiciousContentFound = true;
        sanitized = sanitized.replace(pattern, '');
      }
    });

    if (suspiciousContentFound) {
      securityLogger.logEvent(
        'suspicious_content_sanitized',
        'high',
        {
          context,
          original_length: original.length,
          sanitized_length: sanitized.length,
          patterns_found: true
        }
      );
    }

    return sanitized.trim();
  }
};

// Export all enhanced security utilities
export default {
  EnhancedRateLimiter,
  SecurityHeaders,
  SecureInput,
  SessionSecurity,
  SecureDataHandler
};
