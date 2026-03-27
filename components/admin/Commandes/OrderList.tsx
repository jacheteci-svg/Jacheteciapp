'use client'

import { formatPrix } from '@/lib/utils/formatPrix'
import { Eye, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function OrderList({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Aucune commande trouvée.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-800/30">
            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Client</th>
            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Produit</th>
            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Total</th>
            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {(orders || []).map((o: any) => (
            <tr key={o.id} className="hover:bg-slate-800/30 transition-colors group">
              <td className="p-4">
                 <p className="text-white font-mono text-xs">{new Date(o.created_at).toLocaleDateString('fr-FR')}</p>
                 <p className="text-[10px] text-slate-500 font-mono">{new Date(o.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
              </td>
              <td className="p-4">
                <p className="font-bold text-white uppercase text-sm tracking-tight">{o.client_nom}</p>
                <p className="text-xs text-slate-500 font-medium">{o.client_tel}</p>
                <p className="text-[10px] text-orange-500/80 font-bold uppercase">{o.client_quartier}</p>
              </td>
              <td className="p-4">
                <p className="text-sm font-medium text-slate-300">{o.produits?.nom}</p>
                <p className="text-[10px] text-slate-500">Quantité: {o.quantite}</p>
              </td>
              <td className="p-4 text-center">
                 <span className="font-bold text-orange-500">{formatPrix(o.montant_total)}</span>
              </td>
              <td className="p-4 text-center">
                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    o.statut === 'nouveau' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    o.statut === 'confirme' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    o.statut === 'livre' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {o.statut}
                  </span>
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/commandes/${o.id}`} className="p-2 bg-slate-800 hover:bg-orange-500 text-slate-400 hover:text-white rounded-lg transition-all group-hover:shadow-lg group-hover:shadow-orange-500/20">
                    <Eye size={16} />
                  </Link>
                  <a href={`https://wa.me/${o.client_tel.replace(/\s+/g, '')}`} target="_blank" className="p-2 bg-slate-800 hover:bg-green-500 text-slate-400 hover:text-white rounded-lg transition-all">
                    <MessageCircle size={16} />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
