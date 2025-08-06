
// Centralized font management
export const fontAssets = {
  inter: {
    woff2: '/assets/fonts/inter-font.woff2',
    woff: '/assets/fonts/inter-font.woff',
    ttf: '/assets/fonts/inter-font.ttf'
  },
  roboto: {
    woff2: '/assets/fonts/roboto-font.woff2',
    woff: '/assets/fonts/roboto-font.woff'
  }
};

// Font loading utilities
export const preloadFont = (fontUrl: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.href = fontUrl;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

export const loadFonts = () => {
  // Only preload fonts that are actually used
  preloadFont(fontAssets.inter.woff2);
};
