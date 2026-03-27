import { createClient } from '@/lib/supabase/server'
import OrderDetail from '@/components/admin/Commandes/OrderDetail'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: order } = await supabase
    .from('commandes')
    .select('*, produits(*), zones_livraison(*), livreurs(*)')
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  // Post-fetch livreurs & zones for assignment dropdowns
  const { data: zones } = await supabase.from('zones_livraison').select('*').eq('actif', true)
  const { data: livreurs } = await supabase.from('livreurs').select('*')

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <header className="space-y-4">
        <Link href="/admin/commandes" className="text-slate-500 hover:text-orange-500 flex items-center gap-1 text-sm font-bold transition-colors">
          <ChevronLeft size={16} />
          Retour aux commandes
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white">Commande #{order.id.slice(0, 8)}</h1>
            <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Détails et actions WhatsApp</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
            order.statut === 'nouveau' ? 'bg-orange-500/20 text-orange-400' :
            order.statut === 'confirme' ? 'bg-blue-500/20 text-blue-400' :
            order.statut === 'livre' ? 'bg-green-500/20 text-green-400' :
            'bg-slate-500/20 text-slate-400'
          }`}>
            {order.statut}
          </span>
        </div>
      </header>

      <OrderDetail order={order} zones={zones || []} livreurs={livreurs || []} />
    </div>
  )
}
