
import { Helmet } from 'react-helmet';

interface SecurityHeadersProps {
  nonce?: string;
  additionalCSP?: string;
}

export function SecurityHeaders({ nonce, additionalCSP }: SecurityHeadersProps) {
  const defaultCSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com",
    "style-src 'self' 'unsafe-inline' https://checkout.stripe.com https://fonts.googleapis.com",
    "style-src-elem 'self' https://fonts.googleapis.com https://checkout.stripe.com",
    "font-src 'self' https://fonts.gstatic.com https://checkout.stripe.com",
    "img-src 'self' data: https: https://checkout.stripe.com",
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

  // Permissions Policy otimizada - apenas recursos reconhecidos pelos navegadores modernos
  const permissionsPolicy = [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "payment=()",
    "usb=()",
    "bluetooth=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
    "autoplay=()",
    "encrypted-media=()",
    "fullscreen=()",
    "picture-in-picture=()"
  ].join(", ");

  return (
    <Helmet>
      <meta httpEquiv="Content-Security-Policy" content={csp} />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      <meta httpEquiv="Permissions-Policy" content={permissionsPolicy} />
      <meta httpEquiv="Cross-Origin-Embedder-Policy" content="credentialless" />
      <meta httpEquiv="Cross-Origin-Opener-Policy" content="same-origin-allow-popups" />
      {nonce && <meta name="csp-nonce" content={nonce} />}
    </Helmet>
  );
}
