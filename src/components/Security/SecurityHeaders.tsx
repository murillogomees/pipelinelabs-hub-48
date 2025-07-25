import { Helmet } from 'react-helmet';

interface SecurityHeadersProps {
  nonce?: string;
  additionalCSP?: string;
}

export function SecurityHeaders({ nonce, additionalCSP }: SecurityHeadersProps) {
  const defaultCSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com",
    "style-src 'self' 'unsafe-inline' https://checkout.stripe.com",
    "img-src 'self' data: https: https://checkout.stripe.com",
    "font-src 'self' https: https://checkout.stripe.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://checkout.stripe.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ].join('; ');

  const csp = additionalCSP ? `${defaultCSP}; ${additionalCSP}` : defaultCSP;

  // Note: Security headers should be set via HTTP headers in production
  // Meta tags are used here for development but will show warnings
  return (
    <Helmet>
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
      <meta httpEquiv="Cross-Origin-Embedder-Policy" content="credentialless" />
      <meta httpEquiv="Cross-Origin-Opener-Policy" content="same-origin-allow-popups" />
      {nonce && <meta name="csp-nonce" content={nonce} />}
    </Helmet>
  );
}