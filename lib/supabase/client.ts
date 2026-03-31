
import { createClient as createInsForgeClient } from '@insforge/sdk'

const BASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://4v4zv2hw.eu-central.insforge.app').replace(/\/$/, '')
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTA3NTJ9.q5MYoDPHPgfIDmLrOJWL9ERxUblt3ieWuDNTDYYdQ7s'

let clientInstance: any = null;

export const createClient = () => {
  let userToken = '';
  if (typeof window !== 'undefined') {
    userToken = localStorage.getItem('insforge_token') || '';
    if (!userToken) {
      const match = document.cookie.match(/insforge_token=([^;]+)/);
      if (match) userToken = match[1];
    }
  }

  if (typeof window !== 'undefined' && clientInstance && clientInstance._token === userToken) {
    return clientInstance;
  }

  const insforgeAuth = createInsForgeClient({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
  });

  const insforgeAuthed = userToken ? createInsForgeClient({
    baseUrl: BASE_URL,
    anonKey: userToken,
  }) : insforgeAuth;

  const client = {
    auth: {
      signInWithPassword: async (options: any) => {
        try {
          const res = await fetch(`${BASE_URL}/api/auth/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: options.email, password: options.password }),
          });
          const json = await res.json();
          if (!res.ok) return { data: null, error: { message: json.message || 'Invalid credentials' } };
          
          if (json.accessToken && typeof window !== 'undefined') {
            localStorage.setItem('insforge_token', json.accessToken);
            document.cookie = `insforge_token=${json.accessToken}; path=/; max-age=604800; SameSite=Lax`;
          }
          return { data: { session: { access_token: json.accessToken, user: json.user }, user: json.user }, error: null };
        } catch (e: any) {
          return { data: null, error: { message: e.message } };
        }
      },
      signOut: async () => {
        localStorage.removeItem('insforge_token');
        document.cookie = "insforge_token=; path=/; max-age=0";
        return insforgeAuth.auth.signOut();
      },
      getUser: async () => {
        try {
          const { data, error } = await insforgeAuthed.auth.getCurrentUser();
          return { data: data ? { user: data } : null, error };
        } catch (e: any) {
          return { data: null, error: { message: e.message } };
        }
      },
      onAuthStateChange: (callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: (table: string) => {
      const tableRef = insforgeAuthed.database.from(table);
      
      const chain: any = {
        _filters: [] as any[],
        _single: false,

        select(columns?: string) { return (tableRef as any).select(columns); },
        eq(column: string, value: any) { return (tableRef as any).eq(column, value); },
        order(column: string, options?: any) { return (tableRef as any).order(column, options); },
        single() { return (tableRef as any).single(); },
        
        insert: (values: any) => {
          const records = Array.isArray(values) ? values : [values];
          const query = tableRef.insert(records);
          
          // Mimic Supabase behavior: allow chaining .select().single()
          const originalSelect = query.select.bind(query);
          query.select = (cols?: string) => {
            const selQuery = originalSelect(cols);
            const originalSingle = selQuery.single.bind(selQuery);
            selQuery.single = () => {
              const singleQuery = originalSingle();
              const originalThen = singleQuery.then.bind(singleQuery);
              singleQuery.then = (resolve: any) => originalThen((res: any) => {
                if (res.data && Array.isArray(res.data)) res.data = res.data[0];
                resolve(res);
              });
              return singleQuery;
            };
            return selQuery;
          };
          return query;
        },
        
        update: (idOrValues: any, maybeValues?: any) => {
          // If update(id, values)
          if (maybeValues) {
            return tableRef.update(maybeValues).eq('id', idOrValues);
          }
          // If update(values).eq(...)
          return tableRef.update(idOrValues);
        },
        
        delete: (id?: string) => {
           if (id) return tableRef.delete().eq('id', id);
           return tableRef.delete();
        }
      };
      
      // Fallback for legacy thenable logic on the base chain
      chain.then = (resolve: any) => tableRef.select().then(resolve);
      
      return chain;
    },
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: any) => {
          try {
            const { data, error } = await insforgeAuthed.storage.from(bucket).upload(path, file);
            if (error) return { data: null, error };
            return { data: { url: data.url, key: data.key }, error: null };
          } catch (e: any) {
            return { data: null, error: { message: e.message } };
          }
        },
        getPublicUrl: (path: string) => {
          const url = `${BASE_URL}/api/storage/buckets/${bucket}/objects/${path}`;
          return { data: { publicUrl: url } };
        }
      })
    },
    rpc: (fn: string, args?: any) => insforgeAuthed.database.rpc(fn, args),
  } as any;

  if (typeof window !== 'undefined') {
    client._token = userToken;
    clientInstance = client;
  }

  return client;
};
