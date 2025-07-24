import { Helmet } from 'react-helmet';

interface SecurityHeadersProps {
  nonce?: string;
  additionalCSP?: string;
}

export function SecurityHeaders({ nonce, additionalCSP }: SecurityHeadersProps) {
  const defaultCSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ].join('; ');

  const csp = additionalCSP ? `${defaultCSP}; ${additionalCSP}` : defaultCSP;

  return (
    <Helmet>
      <meta httpEquiv="Content-Security-Policy" content={csp} />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
      <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload" />
      {nonce && <meta name="csp-nonce" content={nonce} />}
    </Helmet>
  );
}