import { getEnvironment, isProduction } from './environment';

// Production readiness checklist
export interface ProductionChecklist {
  database: {
    security_fixes: boolean;
    backups_configured: boolean;
    rls_policies: boolean;
  };
  security: {
    https_enforced: boolean;
    csrf_protection: boolean;
    rate_limiting: boolean;
    headers_configured: boolean;
  };
  monitoring: {
    health_checks: boolean;
    error_tracking: boolean;
    performance_metrics: boolean;
    alerts_configured: boolean;
  };
  infrastructure: {
    domain_configured: boolean;
    ssl_active: boolean;
    cdn_enabled: boolean;
    staging_environment: boolean;
  };
}

export function getProductionReadiness(): ProductionChecklist {
  return {
    database: {
      security_fixes: true, // Fixed in migration
      backups_configured: false, // Needs external setup
      rls_policies: true, // Already implemented
    },
    security: {
      https_enforced: isProduction(),
      csrf_protection: true, // Implemented
      rate_limiting: true, // Implemented
      headers_configured: false, // Needs reverse proxy config
    },
    monitoring: {
      health_checks: true, // Implemented
      error_tracking: false, // Needs Sentry setup
      performance_metrics: true, // Implemented
      alerts_configured: false, // Needs external setup
    },
    infrastructure: {
      domain_configured: false, // Manual setup required
      ssl_active: false, // Manual setup required
      cdn_enabled: false, // Manual setup required
      staging_environment: false, // Needs separate Supabase project
    },
  };
}

export function calculateReadinessScore(checklist: ProductionChecklist): number {
  const items = Object.values(checklist).flatMap(category => Object.values(category));
  const completed = items.filter(item => item === true).length;
  return Math.round((completed / items.length) * 100);
}

export function getProductionTodos(): Array<{
  category: string;
  item: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  manual: boolean;
}> {
  return [
    {
      category: 'Infrastructure',
      item: 'Configure custom domain',
      priority: 'high',
      description: 'Register domain and configure DNS records',
      manual: true,
    },
    {
      category: 'Infrastructure', 
      item: 'Setup SSL certificate',
      priority: 'high',
      description: 'Enable HTTPS with automatic certificate management',
      manual: true,
    },
    {
      category: 'Database',
      item: 'Configure automated backups',
      priority: 'high',
      description: 'Setup daily database backups with retention policy',
      manual: true,
    },
    {
      category: 'Monitoring',
      item: 'Setup Sentry for error tracking',
      priority: 'high',
      description: 'Configure Sentry for production error monitoring',
      manual: true,
    },
    {
      category: 'Infrastructure',
      item: 'Create staging environment',
      priority: 'medium',
      description: 'Setup separate Supabase project for staging',
      manual: true,
    },
    {
      category: 'Security',
      item: 'Configure security headers',
      priority: 'medium',
      description: 'Setup CSP, HSTS, and other security headers via reverse proxy',
      manual: true,
    },
    {
      category: 'Infrastructure',
      item: 'Enable CDN',
      priority: 'medium',
      description: 'Configure CDN for static assets optimization',
      manual: true,
    },
    {
      category: 'Monitoring',
      item: 'Setup alerting',
      priority: 'medium',
      description: 'Configure alerts for downtime and performance issues',
      manual: true,
    },
  ];
}

// Helper to format environment for display
export function formatEnvironmentName(env: string): string {
  switch (env) {
    case 'production':
      return 'Produção';
    case 'staging':
      return 'Homologação';
    case 'preview':
      return 'Preview';
    case 'development':
      return 'Desenvolvimento';
    default:
      return env.charAt(0).toUpperCase() + env.slice(1);
  }
}

// Check if current environment is ready for production traffic
export function isProductionReady(): boolean {
  if (!isProduction()) return false;
  
  const checklist = getProductionReadiness();
  const score = calculateReadinessScore(checklist);
  
  // Require at least 80% completion for production readiness
  return score >= 80;
}

// Get critical production requirements that are missing
export function getCriticalMissingRequirements(): string[] {
  const checklist = getProductionReadiness();
  const missing: string[] = [];
  
  if (!checklist.database.backups_configured) {
    missing.push('Database backups not configured');
  }
  
  if (!checklist.security.https_enforced) {
    missing.push('HTTPS not enforced');
  }
  
  if (!checklist.monitoring.error_tracking) {
    missing.push('Error tracking not setup');
  }
  
  if (!checklist.infrastructure.domain_configured) {
    missing.push('Custom domain not configured');
  }
  
  return missing;
}