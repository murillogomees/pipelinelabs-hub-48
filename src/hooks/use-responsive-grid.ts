import { useState, useEffect } from 'react';

interface GridConfig {
  breakpoints: Record<string, number>;
  cols: Record<string, number>;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
}

export function useResponsiveGrid() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getGridConfig = (): GridConfig => {
    // Mobile (< 480px)
    if (windowWidth < 480) {
      return {
        breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
        cols: { lg: 6, md: 4, sm: 3, xs: 2, xxs: 1 },
        rowHeight: 80,
        margin: [8, 8],
        containerPadding: [8, 8],
      };
    }
    
    // Small tablet (480px - 768px)
    if (windowWidth < 768) {
      return {
        breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
        cols: { lg: 6, md: 4, sm: 3, xs: 2, xxs: 1 },
        rowHeight: 90,
        margin: [10, 10],
        containerPadding: [12, 12],
      };
    }
    
    // Tablet (768px - 996px)
    if (windowWidth < 996) {
      return {
        breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
        cols: { lg: 6, md: 4, sm: 3, xs: 2, xxs: 1 },
        rowHeight: 100,
        margin: [12, 12],
        containerPadding: [16, 16],
      };
    }
    
    // Desktop (> 996px)
    return {
      breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
      cols: { lg: 6, md: 4, sm: 3, xs: 2, xxs: 1 },
      rowHeight: 110,
      margin: [16, 16],
      containerPadding: [0, 0],
    };
  };

  const getCurrentBreakpoint = () => {
    if (windowWidth >= 1200) return 'lg';
    if (windowWidth >= 996) return 'md';
    if (windowWidth >= 768) return 'sm';
    if (windowWidth >= 480) return 'xs';
    return 'xxs';
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1200;
  const isDesktop = windowWidth >= 1200;

  return {
    windowWidth,
    gridConfig: getGridConfig(),
    currentBreakpoint: getCurrentBreakpoint(),
    isMobile,
    isTablet,
    isDesktop,
  };
}