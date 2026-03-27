import { createClient } from '@/lib/supabase/server'
import { formatPrix } from '@/lib/utils/formatPrix'
import Link from 'next/link'

export default async function RecentOrders() {
  const supabase = createClient()
  
  const { data: orders } = await supabase
    .from('commandes')
    .select('*, produits(nom)')
    .order('created_at', { ascending: false })
    .limit(5)

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
        <p className="text-slate-400 font-medium">Aucune commande pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#1e293b] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50">
              <th className="p-4 text-xs font-black text-slate-400 border-b border-slate-700 uppercase tracking-widest">Client</th>
              <th className="p-4 text-xs font-black text-slate-400 border-b border-slate-700 uppercase tracking-widest">Produit</th>
              <th className="p-4 text-xs font-black text-slate-400 border-b border-slate-700 uppercase tracking-widest">Montant</th>
              <th className="p-4 text-xs font-black text-slate-400 border-b border-slate-700 uppercase tracking-widest text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {(orders || []).map((order: any) => (
              <tr key={order.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="p-4">
                  <p className="font-bold text-white">{order.client_nom}</p>
                  <p className="text-xs text-slate-500 font-medium">{order.client_tel}</p>
                </td>
                <td className="p-4 text-sm font-medium text-slate-300">
                  {order.produits?.nom}
                </td>
                <td className="p-4">
                  <span className="font-bold text-orange-500">{formatPrix(order.montant_total)}</span>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    order.statut === 'nouveau' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    order.statut === 'livre' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {order.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
