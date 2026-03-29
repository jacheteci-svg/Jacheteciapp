import { createClient } from '@/lib/supabase/server'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ClientDetail from '@/components/admin/Clients/ClientDetail'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!client) notFound()

  const { data: orders } = await supabase
    .from('commandes')
    .select('*, produits(nom)')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <header className="space-y-4">
        <Link href="/admin/clients" className="text-slate-500 hover:text-orange-500 flex items-center gap-1 text-sm font-bold transition-colors">
          <ChevronLeft size={16} />
          Retour aux clients
        </Link>
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-4xl font-black text-white">{client.nom}</h1>
              <p className="text-orange-500 font-bold font-mono text-lg">{client.telephone}</p>
           </div>
           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              client.statut === 'vip' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' :
              client.statut === 'blackliste' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
              'bg-blue-500/20 text-blue-400 border border-blue-500/20'
            }`}>
              {client.statut}
            </span>
        </div>
      </header>

      <ClientDetail client={client} orders={orders || []} />
    </div>
  )
}
