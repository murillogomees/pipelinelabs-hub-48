
/**
 * Global Component Replacement Strategy
 * This file documents the systematic replacement of old components with optimized versions
 */

export const COMPONENT_REPLACEMENTS = {
  // Enhanced Button - replaces all Button imports
  'Button': {
    from: '@/components/ui/button',
    to: '@/components/ui/enhanced-button',
    newImport: 'EnhancedButton as Button',
    benefits: ['Better responsive sizing', 'Loading states', 'Enhanced variants']
  },
  
  // Optimized Card - replaces basic Card usage
  'Card': {
    from: '@/components/ui/card',
    to: '@/components/ui/optimized-card',
    newImport: 'OptimizedCard',
    benefits: ['Better responsive behavior', 'Enhanced variants', 'Built-in interactive states']
  },
  
  // Optimized Input - replaces Input with enhanced features
  'Input': {
    from: '@/components/ui/input',
    to: '@/components/ui/optimized-input',
    newImport: 'OptimizedInput',
    benefits: ['Better accessibility', 'Built-in validation states', 'Icon support']
  },
  
  // Responsive Layout Components
  'ResponsiveGrid': {
    from: 'manual div grids',
    to: '@/components/ui/responsive-layout',
    newImport: 'ResponsiveGrid',
    benefits: ['Consistent responsive behavior', 'Auto-fit options', 'Proper gap handling']
  },
  
  // Loading Components
  'LoadingSkeleton': {
    from: 'custom loading components',
    to: '@/components/ui/optimized-loading',
    newImport: 'LoadingSkeleton, LoadingSpinner, PageLoading',
    benefits: ['Consistent loading states', 'Multiple variants', 'Shimmer effects']
  }
};

// Priority order for replacement (high impact first)
export const REPLACEMENT_PRIORITY = [
  'Button',      // Most used component
  'Card',        // High visual impact
  'Input',       // User interaction critical
  'LoadingSkeleton', // UX improvement
  'ResponsiveGrid'   // Layout consistency
];

// Files that should be prioritized for replacement
export const HIGH_PRIORITY_FILES = [
  'src/pages/LandingPage.tsx',     // Public facing
  'src/pages/Dashboard.tsx',       // Core functionality
  'src/components/Auth/AuthForm.tsx', // Critical user flow
  'src/components/Base/BaseForm.tsx', // Widely used base
  'src/components/Dashboard/StatsCard.tsx' // Visual impact
];
