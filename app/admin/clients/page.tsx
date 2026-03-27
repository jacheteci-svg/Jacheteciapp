import { createClient } from '@/lib/supabase/server'
import ClientList from '@/components/admin/Clients/ClientList'
import { Search, UserPlus } from 'lucide-react'

export default async function AdminClientsPage() {
  const supabase = createClient()
  
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('total_depense', { ascending: false })

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-white">Clients CRM</h1>
        <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Connaître et fidéliser vos clients</p>
      </header>

      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-4 md:p-6 space-y-6">
         <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                placeholder="Rechercher par nom ou téléphone..." 
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-white text-sm focus:border-orange-500 outline-none transition-all"
              />
            </div>
         </div>

         <ClientList clients={clients || []} />
      </div>
    </div>
  )
}
