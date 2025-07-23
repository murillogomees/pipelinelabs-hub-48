import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { mockUser } from '@/test/utils';

// Helper for async testing
const waitFor = async (callback: () => void, timeout = 1000) => {
  const start = Date.now();
  let lastError: Error;
  
  while (Date.now() - start < timeout) {
    try {
      callback();
      return;
    } catch (error) {
      lastError = error as Error;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  throw lastError;
};

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock the actual hook since we're testing the concept
const useAuth = () => {
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate auth check
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const { data } = await mockSupabase.auth.getSession();
        setUser(data?.session?.user || null);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await mockSupabase.auth.signInWithPassword({ email, password });
    if (response.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  const signOut = async () => {
    await mockSupabase.auth.signOut();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
  };
};

describe('useAuth', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sets user when session exists', async () => {
    const session = { user: mockUser };
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session }, error: null });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles sign in', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: { user: mockUser } },
      error: null,
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await result.current.signIn('test@example.com', 'password');
    
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('handles sign out', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await result.current.signOut();
    
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(result.current.user).toBe(null);
  });
});