
import { createClient as createInsForgeClient } from '@insforge/sdk'

const BASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || '').replace(/\/$/, '')
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!

// Debug check
if (typeof window !== 'undefined') {
  console.log('[Auth] Initializing with:', { BASE_URL, hasKey: !!ANON_KEY });
}

export const createClient = () => {
  const insforge = createInsForgeClient({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
    debug: process.env.NODE_ENV === 'development'
  });

  // Re-map the official SDK to match the existing Supabase-like interface used throughout the app
  return {
    auth: {
      signUp: async (options: any) => {
        try {
          const { data, error } = await insforge.auth.signUp(options);
          return { data, error: error ? { message: error.message, status: error.statusCode } : null };
        } catch (e: any) {
          return { data: null, error: { message: e.message } };
        }
      },
      signInWithPassword: async (options: any) => {
        try {
          const { data, error } = await insforge.auth.signInWithPassword(options);
          if (data?.accessToken && typeof window !== 'undefined') {
             localStorage.setItem('insforge_token', data.accessToken);
             document.cookie = `insforge_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
          }
          return { data, error: error ? { message: error.message, status: error.statusCode } : null };
        } catch (e: any) {
          return { data: null, error: { message: e.message } };
        }
      },
      signOut: async () => insforge.auth.signOut(),
      verifyEmail: async (options: any) => {
        try {
          const { data, error } = await insforge.auth.verifyEmail(options);
          if (data?.accessToken && typeof window !== 'undefined') {
             localStorage.setItem('insforge_token', data.accessToken);
             document.cookie = `insforge_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
          }
          return { data, error: error ? { message: error.message, status: error.statusCode } : null };
        } catch (e: any) {
          return { data: null, error: { message: e.message } };
        }
      },
      resendVerificationEmail: async (options: any) => {
        try {
           const { data, error } = await insforge.auth.resendVerificationEmail(options);
           return { data, error: error ? { message: error.message, status: error.statusCode } : null };
        } catch (e: any) {
           return { data: null, error: { message: e.message } };
        }
      },
      getUser: async () => {
        try {
          const { data, error } = await insforge.auth.getCurrentUser();
          return { data, error: error ? { message: error.message, status: error.statusCode } : null };
        } catch (e: any) {
          return { data: null, error: { message: e.message } };
        }
      }
    },
    // Map .from() to the official database module
    from: (table: string) => insforge.database.from(table),
    // Map .rpc() to the official database module
    rpc: (fn: string, args?: any) => insforge.database.rpc(fn, args),
    // Expose the original sdk if needed
    insforge
  } as any;
};
