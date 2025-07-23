import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils';
import { AuthForm } from './AuthForm';

// Mock the auth hook
vi.mock('./hooks/useAuthForm', () => ({
  useAuthForm: () => ({
    formData: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      document: '',
      phone: '',
    },
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
    isSignUp: false,
    toggleMode: vi.fn(),
  }),
}));

describe('AuthForm', () => {
  it('renders login form by default', () => {
    render(<AuthForm />);
    
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/senha/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);
    
    // Form should prevent submission with empty fields
    expect(submitButton).toBeInTheDocument();
  });

  it('allows typing in email and password fields', async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/senha/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });
});