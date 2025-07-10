import { useEffect, useState } from 'react';
import { useCompanySettings } from './useCompanySettings';

interface BrandingConfig {
  nome_customizado: string;
  cor_primaria: string;
  cor_secundaria: string;
  logo_url: string;
  favicon_url: string;
  dominio_personalizado: string;
}

export function useBranding() {
  const { settings } = useCompanySettings();
  const [branding, setBranding] = useState<BrandingConfig>({
    nome_customizado: 'Pipeline Labs',
    cor_primaria: '#3b82f6',
    cor_secundaria: '#64748b',
    logo_url: '',
    favicon_url: '',
    dominio_personalizado: ''
  });

  useEffect(() => {
    if (settings?.branding) {
      const brandingData = settings.branding as any;
      setBranding({
        nome_customizado: brandingData.nome_customizado || brandingData.nome_sistema || 'Pipeline Labs',
        cor_primaria: brandingData.cor_primaria || '#3b82f6',
        cor_secundaria: brandingData.cor_secundaria || '#64748b',
        logo_url: brandingData.logo_url || '',
        favicon_url: brandingData.favicon_url || '',
        dominio_personalizado: brandingData.dominio_personalizado || ''
      });

      // Apply branding automatically when it loads
      applyBranding(brandingData);
    }
  }, [settings]);

  const applyBranding = (brandingData: any) => {
    const root = document.documentElement;
    
    // Convert hex to HSL for design system
    const hexToHsl = (hex: string) => {
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

    if (brandingData.cor_primaria) {
      const hslPrimary = hexToHsl(brandingData.cor_primaria);
      root.style.setProperty('--primary', hslPrimary);
    }

    if (brandingData.cor_secundaria) {
      const hslSecondary = hexToHsl(brandingData.cor_secundaria);
      root.style.setProperty('--secondary', hslSecondary);
    }

    // Update document title
    if (brandingData.nome_customizado && brandingData.nome_customizado !== 'Pipeline Labs') {
      document.title = brandingData.nome_customizado;
    }

    // Update favicon
    if (brandingData.favicon_url) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = brandingData.favicon_url;
      favicon.type = 'image/png';
    }
  };

  return {
    branding,
    applyBranding
  };
}