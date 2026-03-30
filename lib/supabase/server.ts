
import { createClient as createInsForgeClient } from '@insforge/sdk'
import { cookies } from 'next/headers'

const BASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || '').replace(/\/$/, '')
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!

export const createClient = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('insforge_token')?.value || ''

  const insforge = createInsForgeClient({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
    debug: process.env.NODE_ENV === 'development'
  })

  // Auth update helper
  const updateToken = (newToken: string) => {
    if (!newToken) return;
    if (typeof (insforge.auth as any).setAccessToken === 'function') {
       (insforge.auth as any).setAccessToken(newToken);
    } else if ((insforge as any).setAccessToken === 'function') {
       (insforge as any).setAccessToken(newToken);
    } else if ((insforge as any).options) {
       (insforge as any).options.accessToken = newToken;
    }
  }

  if (token) updateToken(token);

  const wrap = async (promise: Promise<any>) => {
    try {
      const { data, error } = await promise;
      if (error) {
         const msg = (error as any).message || (typeof error === 'string' ? error : JSON.stringify(error));
         return { data: null, error: { message: msg, status: (error as any).statusCode || 500 } };
      }
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: { message: e.message } };
    }
  };

  return {
    auth: {
      getUser: async () => wrap(insforge.auth.getCurrentUser()),
      signOut: async () => insforge.auth.signOut(),
    },
    from: (table: string) => {
      const tableRef = insforge.database.from(table);
      return {
        select: (columns?: string) => {
          let query = (tableRef as any).select(columns === '*' ? undefined : columns);
          
          const chain = {
            eq: (col: string, val: any) => {
               if (typeof query.eq === 'function') query = query.eq(col, val);
               return chain;
            },
            single: async () => {
               const res = await wrap(query);
               if (res.data && Array.isArray(res.data)) res.data = res.data[0] || null;
               return res;
            },
            then: (resolve: any) => resolve(wrap(query))
          };
          
          return chain as any;
        },
        insert: (values: any) => wrap((tableRef as any).insert(Array.isArray(values) ? values : [values])),
        upsert: async (values: any) => {
          const records = Array.isArray(values) ? values : [values];
          const { data, error } = await tableRef.insert(records);
          if (error) {
            const err = error as any;
            const isConflict = err.statusCode === 409 || err.status === 409 ||
                              String(err.message || '').toLowerCase().includes('duplicate');
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
              return { data: Array.isArray(values) ? results : results[0], error: null };
            }
            return { data, error };
          }
          return { data: Array.isArray(values) ? data : (data ? data[0] : null), error: null };
        }
      };
    },
    rpc: (fn: string, args?: any) => insforge.database.rpc(fn, args)
  } as any;
}
