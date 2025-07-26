
import { supabase } from '@/integrations/supabase/client';
import { retryWithBackoff, shouldRetryError } from './networkRetry';
import { createLogger } from './logger';

const logger = createLogger('EnhancedSupabase');

// Enhanced Supabase client with automatic retry
export const enhancedSupabase = {
  from: (table: string) => {
    const originalFrom = supabase.from(table);
    
    return {
      ...originalFrom,
      select: (query?: string) => {
        const originalSelect = originalFrom.select(query);
        
        return {
          ...originalSelect,
          single: () => retryWithBackoff(
            () => originalSelect.single(),
            { maxRetries: 2 }
          ).catch(error => {
            logger.error(`Failed to fetch single record from ${table}`, error);
            throw error;
          }),
          
          maybeSingle: () => retryWithBackoff(
            () => originalSelect.maybeSingle(),
            { maxRetries: 2 }
          ).catch(error => {
            logger.error(`Failed to fetch single record from ${table}`, error);
            throw error;
          }),
          
          then: (onFulfilled?: any, onRejected?: any) => {
            return retryWithBackoff(
              () => originalSelect,
              { maxRetries: 2 }
            ).then(onFulfilled, onRejected).catch(error => {
              logger.error(`Failed to fetch records from ${table}`, error);
              throw error;
            });
          }
        };
      },
      
      insert: (values: any) => retryWithBackoff(
        () => originalFrom.insert(values),
        { maxRetries: 1 }
      ).catch(error => {
        logger.error(`Failed to insert into ${table}`, error);
        throw error;
      }),
      
      update: (values: any) => {
        const originalUpdate = originalFrom.update(values);
        
        return {
          ...originalUpdate,
          eq: (column: string, value: any) => retryWithBackoff(
            () => originalUpdate.eq(column, value),
            { maxRetries: 1 }
          ).catch(error => {
            logger.error(`Failed to update ${table}`, error);
            throw error;
          })
        };
      },
      
      delete: () => {
        const originalDelete = originalFrom.delete();
        
        return {
          ...originalDelete,
          eq: (column: string, value: any) => retryWithBackoff(
            () => originalDelete.eq(column, value),
            { maxRetries: 1 }
          ).catch(error => {
            logger.error(`Failed to delete from ${table}`, error);
            throw error;
          })
        };
      }
    };
  },

  auth: {
    ...supabase.auth,
    signInWithPassword: (credentials: any) => retryWithBackoff(
      () => supabase.auth.signInWithPassword(credentials),
      { maxRetries: 2 }
    ).catch(error => {
      logger.error('Failed to sign in', error);
      throw error;
    }),
    
    signUp: (credentials: any) => retryWithBackoff(
      () => supabase.auth.signUp(credentials),
      { maxRetries: 2 }
    ).catch(error => {
      logger.error('Failed to sign up', error);
      throw error;
    }),
    
    signOut: (options?: any) => retryWithBackoff(
      () => supabase.auth.signOut(options),
      { maxRetries: 2 }
    ).catch(error => {
      logger.error('Failed to sign out', error);
      throw error;
    })
  },

  rpc: (fnName: string, params?: any) => retryWithBackoff(
    () => supabase.rpc(fnName, params),
    { maxRetries: 1 }
  ).catch(error => {
    logger.error(`Failed to call RPC function ${fnName}`, error);
    throw error;
  })
};
