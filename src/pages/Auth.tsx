
import React from 'react';
import { AuthRedirect } from '@/components/Auth/AuthRedirect';
import { AuthForm } from '@/components/Auth/AuthForm';

export default function Auth() {
  return (
    <AuthRedirect>
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </AuthRedirect>
  );
}
