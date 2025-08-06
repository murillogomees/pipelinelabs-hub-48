
// Centralized font management with valid Google Fonts URLs
export const fontAssets = {
  inter: {
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    family: 'Inter',
    fallback: 'sans-serif'
  },
  roboto: {
    url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    family: 'Roboto',
    fallback: 'sans-serif'
  }
};

// Font loading utilities
export const preloadFont = (fontUrl: string) => {
  // Check if font is already preloaded
  const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
  if (existingLink) return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = 'https://fonts.googleapis.com';
  document.head.appendChild(link);

  const link2 = document.createElement('link');
  link2.rel = 'preconnect';
  link2.href = 'https://fonts.gstatic.com';
  link2.crossOrigin = 'anonymous';
  document.head.appendChild(link2);

  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = fontUrl;
  fontLink.onload = () => {
    console.info(`✅ Font loaded: ${fontUrl}`);
  };
  fontLink.onerror = () => {
    console.warn(`❌ Failed to load font: ${fontUrl}`);
  };
  document.head.appendChild(fontLink);
};

export const loadFonts = () => {
  // Only preload fonts that are actually used
  preloadFont(fontAssets.inter.url);
};
