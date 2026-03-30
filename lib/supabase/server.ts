
import { createClient as createInsForgeClient } from '@insforge/sdk'
import { cookies } from 'next/headers'

const BASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://4v4zv2hw.eu-central.insforge.app').replace(/\/$/, '')
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTA3NTJ9.q5MYoDPHPgfIDmLrOJWL9ERxUblt3ieWuDNTDYYdQ7s'

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
      getUser: async () => {
        const { data, error } = await wrap(insforge.auth.getCurrentUser());
        return { data: data ? { user: data } : null, error };
      },
      signOut: async () => insforge.auth.signOut(),
    },
    from: (table: string) => {
      const tableRef = insforge.database.from(table);
      
      const createChain = (query: any) => {
        const chain: any = {
          select: (columns?: string) => createChain((query as any).select(columns === '*' ? undefined : columns)),
          eq: (col: string, val: any) => createChain(typeof query.eq === 'function' ? query.eq(col, val) : query),
          gte: (col: string, val: any) => createChain(typeof query.gte === 'function' ? query.gte(col, val) : query),
          lte: (col: string, val: any) => createChain(typeof query.lte === 'function' ? query.lte(col, val) : query),
          order: (col: string, opts?: any) => createChain(typeof query.order === 'function' ? query.order(col, opts) : query),
          limit: (count: number) => createChain(typeof query.limit === 'function' ? query.limit(count) : query),
          single: async () => {
            const res = await wrap(query);
            if (res.data && Array.isArray(res.data)) res.data = res.data[0] || null;
            return res;
          },
          maybeSingle: async () => {
             const res = await wrap(query);
             if (res.data && Array.isArray(res.data)) res.data = res.data[0] || null;
             return res;
          },
          then: (resolve: any) => resolve(wrap(query))
        };
        return chain;
      };

      return {
        select: (columns?: string) => createChain(tableRef.select(columns === '*' ? undefined : columns)),
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
