
import React, { useEffect } from 'react';

// Manages browser feature policies and reduces console warnings
export function FeaturePolicyManager() {
  useEffect(() => {
    // Set proper feature policy headers via meta tags
    const addMetaTag = (name: string, content: string) => {
      const existing = document.querySelector(`meta[name="${name}"]`);
      if (!existing) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Define allowed features to reduce warnings
    const allowedFeatures = [
      'camera',
      'microphone', 
      'geolocation',
      'accelerometer',
      'gyroscope',
      'magnetometer',
      'payment',
      'usb'
    ].join(' *; ');

    addMetaTag('Permissions-Policy', `${allowedFeatures} *;`);

    // Handle iframe sandboxing warnings
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      if (iframe.sandbox && 
          iframe.sandbox.contains('allow-scripts') && 
          iframe.sandbox.contains('allow-same-origin')) {
        console.info('⚠️ Iframe sandbox configuration detected. Ensure this is intentional for security.');
      }
    });

  }, []);

  return null; // This component doesn't render anything
}
