
import React from 'react';
import { AuthForm } from '@/components/Auth/AuthForm';
import { AuthRedirect } from '@/components/Auth/AuthRedirect';

export default function Auth() {
  return (
    <AuthRedirect>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <AuthForm />
      </div>
    </AuthRedirect>
  );
}
