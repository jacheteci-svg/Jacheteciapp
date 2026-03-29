
import { cookies } from 'next/headers'
import { createClient as createInsForgeClient } from '@insforge/sdk'

const BASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || '').replace(/\/$/, '')
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!

export async function createClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('insforge_token')?.value || '';

  const insforge = createInsForgeClient({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
    // @ts-ignore
    accessToken: token,
    isServerMode: true
  });

  const client = {
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
    from: (table: string) => {
      const tableRef = insforge.database.from(table);
      const wrap = async (promise: Promise<any>) => {
        try {
          const { data, error } = await promise;
          return { data, error: error ? { message: error.message, status: error.statusCode || 500 } : null };
        } catch (e: any) {
          return { data: null, error: { message: e.message } };
        }
      };

      const chain: any = {
        _columns: '*',
        _filters: [] as any[],
        _single: false,
        select(columns?: string) { this._columns = columns || '*'; return this; },
        eq(column: string, value: any) { this._filters.push({ type: 'eq', column, value }); return this; },
        single() { this._single = true; return this; },
        async then(resolve: any) {
          try {
            let query = (tableRef as any).select(this._columns === '*' ? undefined : this._columns);
            for (const filter of this._filters) {
              if (filter.type === 'eq' && typeof query.eq === 'function') query = query.eq(filter.column, filter.value);
            }
            const result = await wrap(query);
            if (this._single && result.data && Array.isArray(result.data)) {
              result.data = result.data[0] || null;
            }
            resolve(result);
          } catch (e: any) {
            resolve({ data: null, error: { message: e.message } });
          }
        }
      };
      return chain;
    },
    rpc: (fn: string, args?: any) => insforge.database.rpc(fn, args),
    insforge
  } as any;

  return client;
}
