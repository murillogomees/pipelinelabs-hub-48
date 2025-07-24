import { checkRateLimit } from './rate-limiter.ts';
import { sanitizeRequestData } from './sanitization.ts';

export interface SecurityOptions {
  maxRequestSize?: number;
  allowedMethods?: string[];
  requireAuth?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  sanitizeInput?: boolean;
  logSecurityEvents?: boolean;
  validateSensitiveOps?: boolean;
}

export async function securityMiddleware(
  req: Request,
  options: SecurityOptions = {}
): Promise<Response | null> {
  const {
    maxRequestSize = 1024 * 1024, // 1MB
    allowedMethods = ['POST', 'GET', 'PUT', 'DELETE'],
    requireAuth = true,
    rateLimit = { maxRequests: 60, windowMs: 60000 },
    sanitizeInput = true,
    logSecurityEvents = true,
    validateSensitiveOps = false
  } = options;

  // Check HTTP method
  if (!allowedMethods.includes(req.method)) {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check content length
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxRequestSize) {
    return new Response(
      JSON.stringify({ error: 'Request too large' }),
      { status: 413, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Apply rate limiting
  const rateLimitResponse = await checkRateLimit(req, rateLimit);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Check authentication if required
  if (requireAuth) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return null; // No security violations
}

export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
}

export function sanitizeEdgeRequest(data: any): any {
  return sanitizeRequestData(data);
}

export function createSecureResponse(data: any, status: number = 200, additionalHeaders: Record<string, string> = {}): Response {
  const securityHeaders = getSecurityHeaders();
  const headers = {
    'Content-Type': 'application/json',
    ...securityHeaders,
    ...additionalHeaders
  };
  
  return new Response(JSON.stringify(data), { status, headers });
}