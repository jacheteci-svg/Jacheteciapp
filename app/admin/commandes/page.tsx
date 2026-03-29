import { createClient } from '@/lib/supabase/server'
import OrderList from '@/components/admin/Commandes/OrderList'
import { Filter, Search } from 'lucide-react'

export default async function AdminCommandesPage() {
  const supabase = await createClient()
  
  const { data: orders } = await supabase
    .from('commandes')
    .select('*, produits(nom)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-white">Commandes</h1>
        <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Suivi et traitement des ventes</p>
      </header>

      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-4 md:p-6 space-y-6">
         <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                placeholder="Client, téléphone, numéro..." 
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-white text-sm focus:border-orange-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-2">
               <button className="bg-[#0f172a] border border-slate-700 text-slate-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:text-white transition-colors">
                  <Filter size={16} />
                  Filtrer
               </button>
            </div>
         </div>

         <OrderList orders={orders || []} />
      </div>
    </div>
  )
}
