
import { cookies } from 'next/headers';

const BASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || '').replace(/\/$/, '');
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;

console.log("[Supabase Server] BASE_URL:", BASE_URL);

export function createClient() {
  const getAuthHeader = async () => {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('insforge_token')?.value;
      if (token) return `Bearer ${token}`;
    } catch (e) { }
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
      getUser: async () => {
        try {
          if (!BASE_URL) throw new Error("BASE_URL is not configured.");
          const resp = await fetch(`${BASE_URL}/api/auth/sessions/current`, {
            headers: { 'Authorization': await getAuthHeader() }
          });
          const data = await safeJson(resp);
          if (!resp.ok) return { data: null, error: data };
          return { data: { user: data.user }, error: null };
        } catch (e: any) {
          console.error("[getUser error]:", e);
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
            'Authorization': await getAuthHeader(),
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

          // Handle empty response for DELETE
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
            'Authorization': await getAuthHeader()
          },
          body: JSON.stringify(args || {})
        });
        const data = await safeJson(resp);
        return { data, error: resp.ok ? null : data };
      } catch (e: any) {
        console.error(`[rpc error] ${name}:`, e);
        return { data: null, error: e };
      }
    }
  };

  return client as any;
}
