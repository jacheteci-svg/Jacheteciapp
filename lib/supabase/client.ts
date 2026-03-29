
import { createClient as createInsForgeClient } from '@insforge/sdk'

const BASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || '').replace(/\/$/, '')
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!

// Debug check
if (typeof window !== 'undefined') {
  console.log('[Auth] Initializing with:', { BASE_URL, hasKey: !!ANON_KEY });
}

let clientInstance: any = null;

export const createClient = () => {
  // Return existing instance in browser to maintain state
  if (typeof window !== 'undefined' && clientInstance) {
    return clientInstance;
  }

  // Get token from storage/cookies for persistence
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('insforge_token') || '';
    if (!token) {
      const match = document.cookie.match(/insforge_token=([^;]+)/);
      if (match) token = match[1];
    }
  }

  const insforge = createInsForgeClient({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
    // @ts-ignore - Support passing initial token if SDK allows
    accessToken: token,
    debug: process.env.NODE_ENV === 'development'
  });

  const client = {
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
      },
      onAuthStateChange: (callback: any) => {
        // Simple mock: doesn't do much but prevents crashes
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    // Map .from() to the official database module
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
        _order: null as any,
        _limit: null as any,
        _single: false,

        select(columns?: string) {
          this._columns = columns || '*';
          return this;
        },
        eq(column: string, value: any) {
          this._filters.push({ type: 'eq', column, value });
          return this;
        },
        order(column: string, options?: any) {
          this._order = { column, ...options };
          return this;
        },
        limit(count: number) {
          this._limit = count;
          return this;
        },
        single() {
          this._single = true;
          return this;
        },
        async then(resolve: any) {
          try {
            let query = (tableRef as any).select(this._columns === '*' ? undefined : this._columns);
            for (const filter of this._filters) {
               if (filter.type === 'eq' && typeof query.eq === 'function') {
                 query = query.eq(filter.column, filter.value);
               }
            }
            const result = await wrap(query);
            if (this._single && result.data && Array.isArray(result.data)) {
              result.data = result.data[0] || null;
            }
            resolve(result);
          } catch (e: any) {
            resolve({ data: null, error: { message: e.message } });
          }
        },
        upsert: async (values: any) => {
          const records = Array.isArray(values) ? values : [values];
          const { data, error } = await tableRef.insert(records);
          if (error) {
            const err = error as any;
            const isConflict = err.statusCode === 409 || err.status === 409 ||
                              String(err.message || '').toLowerCase().includes('duplicate') ||
                              String(err.message || '').toLowerCase().includes('already exists');
            if (isConflict) {
              const results = [];
              for (const record of records) {
                const { id, ...updateData } = record;
                if (id) {
                  const { data: upData, error: upError } = await tableRef.update(id, updateData);
                  if (upError) return { data: null, error: upError };
                  results.push(upData);
                }
              }
              const finalData = Array.isArray(values) ? results : results[0];
              return { data: finalData || null, error: null };
            }
            return { data, error };
          }
          const finalData = Array.isArray(values) ? data : (data ? data[0] : null);
          return { data: finalData, error: null };
        },
        insert: (values: any) => wrap((tableRef as any).insert(Array.isArray(values) ? values : [values])),
        update: (id: string, values: any) => wrap((tableRef as any).update(id, values)),
        delete: (id: string) => wrap((tableRef as any).delete(id))
      };
      return chain;
    },
    rpc: (fn: string, args?: any) => insforge.database.rpc(fn, args),
    insforge
  } as any;

  if (typeof window !== 'undefined') {
    clientInstance = client;
  }

  return client;
};
