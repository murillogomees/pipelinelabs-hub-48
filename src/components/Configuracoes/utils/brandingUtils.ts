// Utility functions for branding and color management

export const hexToHsl = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const validateDomain = (domain: string): boolean => {
  if (!domain) return true; // Optional field
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$/;
  return domainRegex.test(domain);
};

export const applyBrandingToDOM = (branding: {
  cor_primaria: string;
  cor_secundaria: string;
  nome_customizado: string;
  favicon_url?: string;
}, permanent: boolean = false) => {
  const root = document.documentElement;
  
  const hslPrimary = hexToHsl(branding.cor_primaria);
  const hslSecondary = hexToHsl(branding.cor_secundaria);
  
  root.style.setProperty('--primary', hslPrimary);
  root.style.setProperty('--secondary', hslSecondary);

  // Update document title if customized
  if (branding.nome_customizado && branding.nome_customizado !== 'Pipeline Labs') {
    document.title = branding.nome_customizado;
  }

  // Update favicon if provided
  if (branding.favicon_url && permanent) {
    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
    favicon.setAttribute('rel', 'icon');
    favicon.setAttribute('href', branding.favicon_url);
    favicon.setAttribute('type', 'image/png');
    if (!document.querySelector('link[rel="icon"]')) {
      document.head.appendChild(favicon);
    }
  }
};

export const BRANDING_DEFAULTS = {
  nome_customizado: 'Pipeline Labs',
  cor_primaria: '#3b82f6',
  cor_secundaria: '#64748b',
  logo_url: '',
  favicon_url: '',
  dominio_personalizado: ''
};

export const FILE_UPLOAD_LIMITS = {
  logo: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/']
  },
  favicon: {
    maxSize: 1 * 1024 * 1024, // 1MB
    allowedTypes: ['image/']
  }
};