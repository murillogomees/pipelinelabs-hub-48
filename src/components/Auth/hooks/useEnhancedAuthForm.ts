
import { useState } from 'react';
import { useAuthForm } from './useAuthForm';
import { useSecurityLogger } from '@/components/Security/SecurityEventLogger';
import { EnhancedRateLimiter } from '@/utils/securityEnhancements';
import { PasswordStrengthValidator } from '@/components/Security/PasswordStrengthValidator';

interface PasswordStrength {
  score: number;
  max_score: number;
  strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
  is_valid: boolean;
  feedback: string[];
}

interface UseEnhancedAuthFormProps {
  onSuccess?: () => void;
}

export function useEnhancedAuthForm({ onSuccess }: UseEnhancedAuthFormProps = {}) {
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  
  const { logAuthAttempt, logSecurityViolation } = useSecurityLogger();
  
  const baseAuthForm = useAuthForm({ onSuccess });

  const enhancedHandleAuth = async (
    isSignUp: boolean,
    formData: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      companyName?: string;
      document?: string;
      phone?: string;
    }
  ) => {
    const userIdentifier = `auth_${formData.email}`;

    // Enhanced rate limiting with security logging
    const canProceed = await EnhancedRateLimiter.checkWithLogging(
      userIdentifier,
      5, // 5 attempts
      15 * 60 * 1000, // 15 minutes
      isSignUp ? 'signup_attempt' : 'signin_attempt'
    );

    if (!canProceed) {
      await logSecurityViolation('rate_limit_exceeded', {
        email: formData.email,
        attempt_type: isSignUp ? 'signup' : 'signin'
      });
      return;
    }

    // For sign up, check password strength
    if (isSignUp && (!isPasswordValid || !passwordStrength?.is_valid)) {
      await logSecurityViolation('weak_password_attempt', {
        email: formData.email,
        password_strength: passwordStrength?.strength || 'unknown'
      });
      throw new Error('A senha não atende aos requisitos de segurança');
    }

    try {
      // Call the original auth handler
      await baseAuthForm.handleAuth(isSignUp, formData);
      
      // Log successful auth attempt
      await logAuthAttempt(formData.email, true);
      
      // Log attempt for rate limiting
      await EnhancedRateLimiter.logAttempt(
        userIdentifier,
        isSignUp ? 'signup_success' : 'signin_success',
        { timestamp: Date.now() }
      );

    } catch (error: any) {
      // Log failed auth attempt
      await logAuthAttempt(formData.email, false);
      
      // Log attempt for rate limiting
      await EnhancedRateLimiter.logAttempt(
        userIdentifier,
        isSignUp ? 'signup_failure' : 'signin_failure',
        { error: error.message, timestamp: Date.now() }
      );

      throw error;
    }
  };

  const handlePasswordValidation = (isValid: boolean, strength: PasswordStrength | null) => {
    setIsPasswordValid(isValid);
    setPasswordStrength(strength);
  };

  return {
    ...baseAuthForm,
    handleAuth: enhancedHandleAuth,
    passwordStrength,
    isPasswordValid,
    handlePasswordValidation
  };
}
