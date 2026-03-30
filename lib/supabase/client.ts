
import { createClient as createInsForgeClient } from '@insforge/sdk'

const BASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://4v4zv2hw.eu-central.insforge.app').replace(/\/$/, '')
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTA3NTJ9.q5MYoDPHPgfIDmLrOJWL9ERxUblt3ieWuDNTDYYdQ7s'

// Debug check
if (typeof window !== 'undefined') {
  console.log('[Auth] Initializing with:', { BASE_URL, hasKey: !!ANON_KEY });
}

let clientInstance: any = null;

export const createClient = () => {
  // Get token from storage/cookies
  let userToken = '';
  if (typeof window !== 'undefined') {
    userToken = localStorage.getItem('insforge_token') || '';
    if (!userToken) {
      const match = document.cookie.match(/insforge_token=([^;]+)/);
      if (match) userToken = match[1];
    }
  }

  // Reuse cached instance only if token hasn't changed
  if (typeof window !== 'undefined' && clientInstance && clientInstance._token === userToken) {
    return clientInstance;
  }

  // Always create InsForge auth client with ANON key (required for signInWithPassword)
  const insforgeAuth = createInsForgeClient({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
    debug: process.env.NODE_ENV === 'development'
  });

  // Create an authenticated client for storage/DB only if user token is available
  const insforgeAuthed = userToken ? createInsForgeClient({
    baseUrl: BASE_URL,
    anonKey: userToken,
    debug: false
  }) : insforgeAuth;

  // Use authed client for data ops, auth client for auth ops
  const insforge = insforgeAuth;

  const client = {
    auth: {
      updateToken: (newToken: string) => {
        if (!newToken) return;
        // Try various common SDK patterns for setting token
        if (typeof (insforge.auth as any).setAccessToken === 'function') {
           (insforge.auth as any).setAccessToken(newToken);
        } else if ((insforge as any).setAccessToken === 'function') {
           (insforge as any).setAccessToken(newToken);
        } else if ((insforge as any).options) {
           (insforge as any).options.accessToken = newToken;
        }
      },
      signUp: async (options: any) => {
        try {
          const { data, error } = await insforge.auth.signUp(options);
          return { data, error: error ? { message: (error as any).message || String(error), status: (error as any).statusCode } : null };
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
             client.auth.updateToken(data.accessToken);
          }
          // Wrap in session for Supabase compatibility
          const formattedData = data ? { 
            session: { access_token: data.accessToken, user: data.user }, 
            user: data.user 
          } : null;
          return { data: formattedData, error: error ? { message: (error as any).message || String(error), status: (error as any).statusCode } : null };
        } catch (e: any) {
          return { data: null, error: { message: e.message } };
        }
      },
      signOut: async () => {
        localStorage.removeItem('insforge_token');
        document.cookie = "insforge_token=; path=/; max-age=0";
        return insforge.auth.signOut();
      },
      verifyEmail: async (options: any) => {
        try {
          const { data, error } = await insforge.auth.verifyEmail(options);
          if (data?.accessToken && typeof window !== 'undefined') {
             localStorage.setItem('insforge_token', data.accessToken);
             document.cookie = `insforge_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
             client.auth.updateToken(data.accessToken);
          }
          // Wrap in session for Supabase compatibility
          const formattedData = data ? { 
            session: { access_token: data.accessToken, user: data.user }, 
            user: data.user 
          } : null;
          return { data: formattedData, error: error ? { message: (error as any).message || String(error), status: (error as any).statusCode } : null };
        } catch (e: any) {
          return { data: null, error: { message: e.message } };
        }
      },
      // ... getUser and others ...
      getUser: async () => {
        try {
          const { data, error } = await insforgeAuthed.auth.getCurrentUser();
          return { data: data ? { user: data } : null, error: error ? { message: (error as any).message || String(error), status: (error as any).statusCode } : null };
        } catch (e: any) {
          return { data: null, error: { message: e.message } };
        }
      },
      onAuthStateChange: (callback: any) => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: (table: string) => {
      if (typeof window !== 'undefined') {
        console.log('[Database] Querying table:', table);
      }
      const tableRef = insforgeAuthed.database.from(table);
      
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
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: any) => {
          try {
        const token = (typeof window !== 'undefined' ? localStorage.getItem('insforge_token') : null) || ANON_KEY;
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

            // Step 1: Get upload strategy
            const strategyRes = await fetch(`${BASE_URL}/api/storage/buckets/${bucket}/upload-strategy`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                filename: file.name || path.split('/').pop(),
                contentType: file.type || 'application/octet-stream',
                size: file.size,
              }),
            });

            if (!strategyRes.ok) {
              const errBody = await strategyRes.text();
              return { data: null, error: { message: `Strategy failed (${strategyRes.status}): ${errBody}` } };
            }

            const strategy = await strategyRes.json();
            const formData = new FormData();

            let uploadRes: Response;

            if (strategy.method === 'presigned') {
              // S3 presigned upload
              // Include all required S3 fields
              if (strategy.fields) {
                Object.entries(strategy.fields).forEach(([k, v]) => formData.append(k, v as string));
              }
              formData.append('file', file);
              uploadRes = await fetch(strategy.uploadUrl, { method: 'POST', body: formData });
            } else {
              // Direct upload (local storage) — PUT to uploadUrl
              const directUrl = strategy.uploadUrl.startsWith('http')
                ? strategy.uploadUrl
                : `${BASE_URL}${strategy.uploadUrl}`;
              formData.append('file', file);
              uploadRes = await fetch(directUrl, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
              });
            }

            if (!uploadRes.ok) {
              const errBody = await uploadRes.text();
              return { data: null, error: { message: `Upload failed (${uploadRes.status}): ${errBody}` } };
            }

            // Step 3: Confirm if required (S3)
            if (strategy.confirmRequired && strategy.confirmUrl) {
              const confirmUrl = strategy.confirmUrl.startsWith('http')
                ? strategy.confirmUrl
                : `${BASE_URL}${strategy.confirmUrl}`;
              await fetch(confirmUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({ size: file.size, contentType: file.type }),
              });
            }

            // Build public URL. The 'key' returned is the actual object key
            const key = strategy.key || path;
            const publicUrl = `${BASE_URL}/api/storage/buckets/${bucket}/objects/${key}`;
            return { data: { url: publicUrl, key }, error: null };

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
    insforge: insforgeAuthed
  } as any;

  // Cache with token fingerprint for invalidation
  if (typeof window !== 'undefined') {
    client._token = userToken;
    clientInstance = client;
  }

  return client;
};
