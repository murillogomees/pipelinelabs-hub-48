
import { useEffect, useState } from 'react';

export function CSRFToken() {
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    // Generate a simple CSRF token
    const token = btoa(Math.random().toString()).substring(0, 32);
    setCsrfToken(token);
  }, []);

  return (
    <input
      type="hidden"
      name="csrfToken"
      value={csrfToken}
    />
  );
}
