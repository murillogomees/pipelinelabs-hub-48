
// Simplified font management with only Google Fonts
export const fontAssets = {
  inter: {
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    family: 'Inter',
    fallback: 'sans-serif'
  }
};

// Simple font loading function - using only Google Fonts to avoid 404 errors
export const loadFonts = () => {
  // Check if font is already loaded
  const existingLink = document.querySelector(`link[href="${fontAssets.inter.url}"]`);
  if (existingLink) return;

  // Create preconnect links for better performance
  const preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect';
  preconnect1.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnect1);

  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect2);

  // Load the font directly from Google Fonts
  const fontLink = document.createElement('link') as HTMLLinkElement;
  fontLink.rel = 'stylesheet';
  fontLink.href = fontAssets.inter.url;
  document.head.appendChild(fontLink);
};
