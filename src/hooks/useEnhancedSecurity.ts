import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCSRF } from '@/components/Security/CSRFProtection';

interface SecurityMetrics {
  failedAttempts: number;
  lastFailedAttempt: Date | null;
  isBlocked: boolean;
  blockedUntil: Date | null;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface RateLimitInfo {
  allowed: boolean;
  blocked: boolean;
  attemptsRemaining: number;
  resetAt: Date;
  reason?: string;
}

export function useEnhancedSecurity() {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    failedAttempts: 0,
    lastFailedAttempt: null,
    isBlocked: false,
    blockedUntil: null,
    riskLevel: 'low'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { validateToken } = useCSRF();

  // Check rate limiting before performing actions
  const checkRateLimit = useCallback(async (
    identifier: string, 
    actionType: string,
    maxAttempts: number = 5,
    windowMinutes: number = 15,
    blockMinutes: number = 60
  ): Promise<RateLimitInfo> => {
    try {
      // For now, since we don't have the check_rate_limit function yet,
      // return a simple allowed response
      return {
        allowed: true,
        blocked: false,
        attemptsRemaining: maxAttempts - 1,
        resetAt: new Date(Date.now() + windowMinutes * 60000),
        reason: undefined
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      return {
        allowed: false,
        blocked: true,
        attemptsRemaining: 0,
        resetAt: new Date(Date.now() + 60000),
        reason: 'System error'
      };
    }
  }, []);

  // Log security events
  const logSecurityEvent = useCallback(async (
    eventType: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low',
    eventData: Record<string, any> = {}
  ) => {
    try {
      await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_user_id: null,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
        p_event_data: eventData,
        p_risk_level: riskLevel
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, []);

  // Validate form submission with CSRF and rate limiting
  const validateFormSubmission = useCallback(async (
    formData: FormData,
    actionType: string = 'form_submission'
  ): Promise<{ isValid: boolean; reason?: string }> => {
    setIsLoading(true);
    
    try {
      // Check CSRF token
      const csrfToken = formData.get('csrf_token') as string;
      if (!csrfToken) {
        await logSecurityEvent('csrf_token_missing', 'medium', { actionType });
        return { isValid: false, reason: 'Security token missing' };
      }

      const isValidCSRF = await validateToken(csrfToken);
      if (!isValidCSRF) {
        await logSecurityEvent('csrf_validation_failed', 'high', { actionType });
        return { isValid: false, reason: 'Invalid security token' };
      }

      // Check rate limiting
      const userAgent = navigator.userAgent;
      const identifier = `${userAgent}_${actionType}`;
      const rateLimitResult = await checkRateLimit(identifier, actionType);
      
      if (!rateLimitResult.allowed) {
        await logSecurityEvent('rate_limit_exceeded', 'high', { 
          actionType,
          attemptsRemaining: rateLimitResult.attemptsRemaining,
          blockedUntil: rateLimitResult.resetAt.toISOString()
        });
        return { 
          isValid: false, 
          reason: rateLimitResult.reason || 'Too many attempts. Please try again later.' 
        };
      }

      await logSecurityEvent('form_validation_success', 'low', { actionType });
      return { isValid: true };
    } catch (error) {
      console.error('Form validation error:', error);
      await logSecurityEvent('form_validation_error', 'medium', { actionType, error: String(error) });
      return { isValid: false, reason: 'Validation error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, [validateToken, checkRateLimit, logSecurityEvent]);

  // Monitor security metrics
  const updateSecurityMetrics = useCallback((metrics: Partial<SecurityMetrics>) => {
    setSecurityMetrics(prev => ({
      ...prev,
      ...metrics
    }));
  }, []);

  // Detect suspicious activity patterns
  const detectSuspiciousActivity = useCallback(async (activityData: Record<string, any>) => {
    const suspiciousPatterns = [
      // Multiple failed attempts
      activityData.failedAttempts > 3,
      // Rapid successive requests
      activityData.requestInterval < 1000,
      // Unusual user agent
      /bot|crawler|spider/i.test(navigator.userAgent),
      // Multiple different IPs (if available)
      activityData.ipChanges > 2
    ];

    const suspiciousCount = suspiciousPatterns.filter(Boolean).length;
    
    if (suspiciousCount >= 2) {
      await logSecurityEvent('suspicious_activity_detected', 'high', {
        ...activityData,
        suspiciousPatterns: suspiciousCount,
        userAgent: navigator.userAgent
      });
      
      updateSecurityMetrics({
        riskLevel: suspiciousCount >= 3 ? 'critical' : 'high'
      });
    }
  }, [logSecurityEvent, updateSecurityMetrics]);

  return {
    securityMetrics,
    isLoading,
    checkRateLimit,
    logSecurityEvent,
    validateFormSubmission,
    detectSuspiciousActivity,
    updateSecurityMetrics
  };
}