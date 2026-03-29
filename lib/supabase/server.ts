
import { cookies } from 'next/headers'
import { createClient as createInsForgeClient } from '@insforge/sdk'

const BASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || '').replace(/\/$/, '')
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!

export async function createClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('insforge_token')?.value;

  const insforge = createInsForgeClient({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
    edgeFunctionToken: token, // Used for authenticated requests
    isServerMode: true
  });

  return {
    auth: {
      getUser: async () => {
        try {
          const { data, error } = await insforge.auth.getCurrentUser();
          return { data, error: error ? { message: error.message, status: error.statusCode } : null };
        } catch (e: any) {
          return { data: null, error: { message: e.message } };
        }
      }
    },
    from: (table: string) => insforge.database.from(table),
    rpc: (fn: string, args?: any) => insforge.database.rpc(fn, args),
    insforge
  } as any;
}
