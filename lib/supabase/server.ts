
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;

export function createClient() {
  const getAuthHeader = async () => {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('insforge_token')?.value;
      if (token) return `Bearer ${token}`;
    } catch (e) { }
    return `Bearer ${ANON_KEY}`;
  };

  const client = {
    auth: {
      getUser: async () => {
        try {
          const resp = await fetch(`${BASE_URL}/api/auth/sessions/current`, {
            headers: { 'Authorization': await getAuthHeader() }
          });
          const data = await resp.json();
          if (!resp.ok) return { data: null, error: data };
          return { data: { user: data.user }, error: null };
        } catch (e: any) {
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

          const result = await resp.json();
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
        const data = await resp.json();
        return { data, error: resp.ok ? null : data };
      } catch (e: any) {
        return { data: null, error: e };
      }
    }
  };

  return client as any;
}
