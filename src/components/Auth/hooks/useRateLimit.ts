import { useState, useEffect } from 'react';
import { rateLimiter } from '@/utils/security';

export function useRateLimit() {
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitTime, setRateLimitTime] = useState(0);

  useEffect(() => {
    if (rateLimited && rateLimitTime > 0) {
      const timer = setInterval(() => {
        const remaining = rateLimiter.getRemainingTime('auth_attempts');
        setRateLimitTime(remaining);
        if (remaining <= 0) {
          setRateLimited(false);
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [rateLimited, rateLimitTime]);

  return {
    rateLimited,
    rateLimitTime,
    setRateLimited,
    setRateLimitTime,
  };
}