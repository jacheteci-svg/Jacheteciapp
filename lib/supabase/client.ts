
const BASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || '').replace(/\/$/, '');
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;

export function createClient() {
  const getAuthHeader = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('insforge_token');
      if (token) return `Bearer ${token}`;
    }
    return `Bearer ${ANON_KEY}`;
  };

  const safeJson = async (resp: Response) => {
    const contentType = resp.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        return await resp.json();
      } catch (e) {
        throw new Error(`JSON_PARSE_ERROR: ${resp.status}`);
      }
    }
    const text = await resp.text();
    throw new Error(`INVALID_RESPONSE (${resp.status}): ${text.slice(0, 100)}...`);
  };

  const client = {
    auth: {
      signUp: async ({ email, password, name, options }: any) => {
        try {
          if (!BASE_URL) throw new Error("BASE_URL is not configured.");
          const resp = await fetch(`${BASE_URL}/api/auth/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ANON_KEY}`
            },
            body: JSON.stringify({ email, password, name })
          });
          const data = await safeJson(resp);
          if (!resp.ok) return { data: null, error: data };
          return { data, error: null };
        } catch (e: any) {
          console.error("[signUp error]:", e);
          return { data: null, error: e };
        }
      },
      signInWithPassword: async ({ email, password }: any) => {
        try {
          const resp = await fetch(`${BASE_URL}/api/auth/sessions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ANON_KEY}`
            },
            body: JSON.stringify({ email, password })
          });
          const data = await safeJson(resp);
          if (!resp.ok) return { data: null, error: data };
          
          if (typeof window !== 'undefined' && data.accessToken) {
            localStorage.setItem('insforge_token', data.accessToken);
            document.cookie = `insforge_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
          }
          return { data, error: null };
        } catch (e: any) {
          console.error("[signIn error]:", e);
          return { data: null, error: e };
        }
      },
      signOut: async () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('insforge_token');
          document.cookie = 'insforge_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        return { error: null };
      },
      getUser: async () => {
        try {
          const resp = await fetch(`${BASE_URL}/api/auth/sessions/current`, {
            headers: { 'Authorization': getAuthHeader() }
          });
          const data = await safeJson(resp);
          if (!resp.ok) return { data: null, error: data };
          return { data: { user: data.user }, error: null };
        } catch (e: any) {
          console.error("[getUser error]:", e);
          return { data: null, error: e };
        }
      },
      verifyEmail: async ({ email, otp }: { email: string; otp: string }) => {
        try {
          const resp = await fetch(`${BASE_URL}/api/auth/email/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ANON_KEY}`
            },
            body: JSON.stringify({ email, otp })
          });
          const data = await safeJson(resp);
          if (!resp.ok) return { data: null, error: data };
          
          if (typeof window !== 'undefined' && data.accessToken) {
            localStorage.setItem('insforge_token', data.accessToken);
            document.cookie = `insforge_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
          }
          return { data, error: null };
        } catch (e: any) {
          console.error("[verifyEmail error]:", e);
          return { data: null, error: e };
        }
      },
      resendVerificationEmail: async ({ email }: { email: string }) => {
        try {
          const resp = await fetch(`${BASE_URL}/api/auth/email/send-verification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ANON_KEY}`
            },
            body: JSON.stringify({ email })
          });
          const data = await safeJson(resp);
          if (!resp.ok) return { data: null, error: data };
          return { data, error: null };
        } catch (e: any) {
          console.error("[resendVerification error]:", e);
          return { data: null, error: e };
        }
      }
    },
    from: (table: string) => {
      let filters: string[] = [];
      let order: string | null = null;
      let limit: number | null = null;
      let isSingle = false;
      let selectedColumns = '*';
      let method = 'GET';
      let bodyData: any = null;
      let customHeaders: Record<string, string> = {};

      const execute = async () => {
        try {
          let url = `${BASE_URL}/api/database/records/${table}?select=${selectedColumns}`;
          if (filters.length > 0) url += `&${filters.join('&')}`;
          if (order) url += `&order=${order}`;
          if (limit) url += `&limit=${limit}`;

          const headers: any = { 
            'Authorization': getAuthHeader(),
            ...customHeaders
          };
          if (method !== 'GET' && method !== 'DELETE') {
            headers['Content-Type'] = 'application/json';
          }

          const resp = await fetch(url, {
            method,
            headers,
            body: bodyData ? JSON.stringify(bodyData) : undefined
          });

          if (method === 'DELETE' && resp.ok) return { error: null };

          const result = await safeJson(resp);
          if (!resp.ok) {
            console.error(`[REST ERROR] ${method} ${table}, Status: ${resp.status}, Error:`, result);
            return { data: null, error: result };
          }
          
          const data = result.rows || result;

          if (isSingle) {
            return { data: data && Array.isArray(data) ? data[0] : (data || null), error: null };
          }
          return { data, error: null };
        } catch (e: any) {
          console.error(`[FETCH ERROR] ${method} ${table}:`, e);
          return { data: null, error: e };
        }
      };

      const builder = {
        select: (columns = '*') => {
          selectedColumns = columns;
          return builder;
        },
        eq: (column: string, value: any) => {
          filters.push(`${column}=eq.${value}`);
          return builder;
        },
        gte: (column: string, value: any) => {
          filters.push(`${column}=gte.${value}`);
          return builder;
        },
        lte: (column: string, value: any) => {
          filters.push(`${column}=lte.${value}`);
          return builder;
        },
        gt: (column: string, value: any) => {
          filters.push(`${column}=gt.${value}`);
          return builder;
        },
        lt: (column: string, value: any) => {
          filters.push(`${column}=lt.${value}`);
          return builder;
        },
        ilike: (column: string, value: any) => {
          filters.push(`${column}=ilike.${value}`);
          return builder;
        },
        order: (column: string, { ascending = true } = {}) => {
          order = `${column}.${ascending ? 'asc' : 'desc'}`;
          return builder;
        },
        limit: (n: number) => {
          limit = n;
          return builder;
        },
        single: () => {
          isSingle = true;
          return builder;
        },
        insert: (values: any) => {
          method = 'POST';
          bodyData = Array.isArray(values) ? values : [values];
          customHeaders['Prefer'] = 'return=representation';
          return builder;
        },
        upsert: (values: any, { onConflict }: any = {}) => {
          method = 'POST';
          bodyData = Array.isArray(values) ? values : [values];
          customHeaders['Prefer'] = 'return=representation,resolution=merge-duplicates';
          if (onConflict) filters.push(`on_conflict=${onConflict}`);
          return builder;
        },
        update: (values: any) => {
          method = 'PATCH';
          bodyData = values;
          customHeaders['Prefer'] = 'return=representation';
          return builder;
        },
        delete: () => {
          method = 'DELETE';
          return builder;
        },
        then: (onfulfilled?: any, onrejected?: any) => {
          return execute().then(onfulfilled, onrejected);
        }
      };
      return builder;
    },
    rpc: async (name: string, args?: any) => {
      try {
        const resp = await fetch(`${BASE_URL}/api/database/rpc/${name}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader()
          },
          body: JSON.stringify(args || {})
        });
        const data = await safeJson(resp);
        return { data, error: resp.ok ? null : data };
      } catch (e: any) {
        console.error(`[rpc error] ${name}:`, e);
        return { data: null, error: e };
      }
    },
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: File) => {
          try {
            const formData = new FormData();
            formData.append('file', file);
            
            const resp = await fetch(`${BASE_URL}/api/storage/buckets/${bucket}/objects/${path}`, {
              method: 'POST',
              headers: { 'Authorization': getAuthHeader() },
              body: formData
            });
            const data = await safeJson(resp);
            if (!resp.ok) return { data: null, error: data };
            
            // Standard Supabase-like return. url is usually publicUrl-able.
            return { data: { path, id: data.id, url: data.url || `${BASE_URL}/api/storage/buckets/${bucket}/objects/${path}` }, error: null };
          } catch (e: any) {
            return { data: null, error: e };
          }
        },
        getPublicUrl: (path: string) => {
           return { data: { publicUrl: `${BASE_URL}/api/storage/buckets/${bucket}/objects/${path}` } };
        },
        remove: async (paths: string[]) => {
           // Not strictly needed for now but good for completion
           return { error: null };
        }
      })
    }
  };

  return client as any;
}
