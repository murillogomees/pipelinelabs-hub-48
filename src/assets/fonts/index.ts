
// Enhanced font management with Google Fonts only
export const fontAssets = {
  inter: {
    url: 'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&display=swap',
    family: 'Inter',
    fallback: 'system-ui, -apple-system, sans-serif'
  }
};

// Optimized font loading function - prevents 404 errors
export const loadFonts = () => {
  // Check if font is already loaded
  const existingLink = document.querySelector(`link[href*="fonts.googleapis.com"][href*="Inter"]`);
  if (existingLink) return;

  // Create preconnect links for better performance (only if not exists)
  if (!document.querySelector('link[href="https://fonts.googleapis.com"]')) {
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);
  }

  if (!document.querySelector('link[href="https://fonts.gstatic.com"]')) {
    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);
  }

  // Load the font directly from Google Fonts
  const fontLink = document.createElement('link') as HTMLLinkElement;
  fontLink.rel = 'stylesheet';
  fontLink.href = fontAssets.inter.url;
  fontLink.onload = () => {
    document.documentElement.style.setProperty('--font-loaded', '1');
  };
  document.head.appendChild(fontLink);
};
