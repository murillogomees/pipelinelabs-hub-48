import { useState, useEffect } from 'react';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type BreakpointKey = keyof BreakpointConfig;

interface UseResponsiveBreakpointsReturn {
  current: BreakpointKey;
  width: number;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
  isAbove: (breakpoint: BreakpointKey) => boolean;
  isBelow: (breakpoint: BreakpointKey) => boolean;
  isBetween: (min: BreakpointKey, max: BreakpointKey) => boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
}

export function useResponsiveBreakpoints(
  customBreakpoints?: Partial<BreakpointConfig>
): UseResponsiveBreakpointsReturn {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1200; // Default fallback for SSR
  });

  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    const handleTouchDetection = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    // Initial detection
    handleResize();
    handleTouchDetection();

    window.addEventListener('resize', handleResize);
    window.addEventListener('touchstart', handleTouchDetection, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('touchstart', handleTouchDetection);
    };
  }, []);

  const getCurrentBreakpoint = (): BreakpointKey => {
    if (windowWidth >= breakpoints['2xl']) return '2xl';
    if (windowWidth >= breakpoints.xl) return 'xl';
    if (windowWidth >= breakpoints.lg) return 'lg';
    if (windowWidth >= breakpoints.md) return 'md';
    if (windowWidth >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  const isAbove = (breakpoint: BreakpointKey): boolean => {
    return windowWidth >= breakpoints[breakpoint];
  };

  const isBelow = (breakpoint: BreakpointKey): boolean => {
    return windowWidth < breakpoints[breakpoint];
  };

  const isBetween = (min: BreakpointKey, max: BreakpointKey): boolean => {
    return windowWidth >= breakpoints[min] && windowWidth < breakpoints[max];
  };

  const current = getCurrentBreakpoint();

  return {
    current,
    width: windowWidth,
    isXs: current === 'xs',
    isSm: current === 'sm',
    isMd: current === 'md',
    isLg: current === 'lg',
    isXl: current === 'xl',
    is2xl: current === '2xl',
    isAbove,
    isBelow,
    isBetween,
    isMobile: windowWidth < breakpoints.md, // < 768px
    isTablet: isBetween('md', 'lg'), // 768px - 1024px
    isDesktop: windowWidth >= breakpoints.lg, // >= 1024px
    isTouch,
  };
}

// Convenience hook for common responsive checks
export function useScreenSize() {
  const { isMobile, isTablet, isDesktop, isTouch, current, width } = useResponsiveBreakpoints();
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    isSmallScreen: isMobile || isTablet,
    isLargeScreen: isDesktop,
    current,
    width,
    // Semantic helpers
    shouldShowMobileNav: isMobile,
    shouldShowDesktopSidebar: isDesktop,
    shouldUseCompactLayout: isMobile,
    shouldShowExtendedContent: isDesktop,
  };
}