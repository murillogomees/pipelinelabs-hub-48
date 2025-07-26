
import { supabase } from '@/integrations/supabase/client';
import { retryWithBackoff, shouldRetryError } from './networkRetry';
import { createLogger } from './logger';
import type { Database } from '@/integrations/supabase/types';

const logger = createLogger('EnhancedSupabase');

// Enhanced Supabase client with automatic retry
export const enhancedSupabase = {
  from: <T extends keyof Database['public']['Tables']>(table: T) => {
    const originalFrom = supabase.from(table);
    
    return {
      ...originalFrom,
      select: (query?: string) => {
        const originalSelect = originalFrom.select(query);
        
        return {
          ...originalSelect,
          single: async () => {
            try {
              const result = await retryWithBackoff(
                async () => await originalSelect.single(),
                { maxRetries: 2 }
              );
              return result;
            } catch (error) {
              logger.error(`Failed to fetch single record from ${String(table)}`, error);
              throw error;
            }
          },
          
          maybeSingle: async () => {
            try {
              const result = await retryWithBackoff(
                async () => await originalSelect.maybeSingle(),
                { maxRetries: 2 }
              );
              return result;
            } catch (error) {
              logger.error(`Failed to fetch single record from ${String(table)}`, error);
              throw error;
            }
          },
          
          then: async (onFulfilled?: any, onRejected?: any) => {
            try {
              const result = await retryWithBackoff(
                async () => await originalSelect,
                { maxRetries: 2 }
              );
              return Promise.resolve(result).then(onFulfilled, onRejected);
            } catch (error) {
              logger.error(`Failed to fetch records from ${String(table)}`, error);
              return Promise.reject(error).then(onFulfilled, onRejected);
            }
          }
        };
      },
      
      insert: async (values: any) => {
        try {
          const result = await retryWithBackoff(
            async () => await originalFrom.insert(values),
            { maxRetries: 1 }
          );
          return result;
        } catch (error) {
          logger.error(`Failed to insert into ${String(table)}`, error);
          throw error;
        }
      },
      
      update: (values: any) => {
        const originalUpdate = originalFrom.update(values);
        
        return {
          ...originalUpdate,
          eq: async (column: string, value: any) => {
            try {
              const result = await retryWithBackoff(
                async () => await originalUpdate.eq(column, value),
                { maxRetries: 1 }
              );
              return result;
            } catch (error) {
              logger.error(`Failed to update ${String(table)}`, error);
              throw error;
            }
          }
        };
      },
      
      delete: () => {
        const originalDelete = originalFrom.delete();
        
        return {
          ...originalDelete,
          eq: async (column: string, value: any) => {
            try {
              const result = await retryWithBackoff(
                async () => await originalDelete.eq(column, value),
                { maxRetries: 1 }
              );
              return result;
            } catch (error) {
              logger.error(`Failed to delete from ${String(table)}`, error);
              throw error;
            }
          }
        };
      }
    };
  },

  auth: {
    ...supabase.auth,
    signInWithPassword: async (credentials: any) => {
      try {
        const result = await retryWithBackoff(
          async () => await supabase.auth.signInWithPassword(credentials),
          { maxRetries: 2 }
        );
        return result;
      } catch (error) {
        logger.error('Failed to sign in', error);
        throw error;
      }
    },
    
    signUp: async (credentials: any) => {
      try {
        const result = await retryWithBackoff(
          async () => await supabase.auth.signUp(credentials),
          { maxRetries: 2 }
        );
        return result;
      } catch (error) {
        logger.error('Failed to sign up', error);
        throw error;
      }
    },
    
    signOut: async (options?: any) => {
      try {
        const result = await retryWithBackoff(
          async () => await supabase.auth.signOut(options),
          { maxRetries: 2 }
        );
        return result;
      } catch (error) {
        logger.error('Failed to sign out', error);
        throw error;
      }
    }
  },

  rpc: async <T extends keyof Database['public']['Functions']>(fnName: T, params?: any) => {
    try {
      const result = await retryWithBackoff(
        async () => await supabase.rpc(fnName, params),
        { maxRetries: 1 }
      );
      return result;
    } catch (error) {
      logger.error(`Failed to call RPC function ${String(fnName)}`, error);
      throw error;
    }
  }
};
