import { checkRateLimit } from './rate-limiter.ts';
import { sanitizeRequestData } from '../../../src/lib/validation/sanitization.ts';

export interface SecurityOptions {
  maxRequestSize?: number;
  allowedMethods?: string[];
  requireAuth?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  sanitizeInput?: boolean;
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
    sanitizeInput = true
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

export function sanitizeEdgeRequest(data: any): any {
  return sanitizeRequestData(data);
}