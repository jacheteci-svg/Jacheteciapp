import { createClient } from '@/lib/supabase/server'
import ClientList from '@/components/admin/Clients/ClientList'

export default async function AdminClientsPage() {
  const supabase = await createClient()
  
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('total_depense', { ascending: false })

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Clients CRM</h1>
        <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Connaître et fidéliser vos clients</p>
      </header>

      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-4 md:p-6 space-y-6">
         <ClientList clients={clients || []} />
      </div>
    </div>
  )
}
