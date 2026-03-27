'use client'

import { formatPrix } from '@/lib/utils/formatPrix'
import { Eye, MessageCircle, Star } from 'lucide-react'
import Link from 'next/link'

export default function ClientList({ clients }: { clients: any[] }) {
  if (clients.length === 0) {
    return <div className="p-12 text-center text-slate-500 font-medium">Aucun client enregistré.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-800/30">
            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Client</th>
            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Commandes</th>
            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Dépense Total</th>
            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {clients.map((c) => (
            <tr key={c.id} className="hover:bg-slate-800/30 transition-colors group">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    c.statut === 'vip' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {c.nom.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{c.nom}</p>
                    <p className="text-xs text-slate-500 font-mono">{c.telephone}</p>
                  </div>
                </div>
              </td>
              <td className="p-4 text-center">
                 <span className="font-mono font-bold text-slate-300 bg-slate-800/50 px-3 py-1 rounded-lg">
                    {c.total_commandes}
                 </span>
              </td>
              <td className="p-4 text-center">
                 <span className="font-black text-orange-500">{formatPrix(c.total_depense)}</span>
              </td>
              <td className="p-4 text-center">
                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    c.statut === 'vip' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    c.statut === 'blackliste' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {c.statut}
                  </span>
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2 text-slate-500">
                  <Link href={`/admin/clients/${c.id}`} className="p-2 hover:bg-orange-500 hover:text-white rounded-lg transition-all">
                    <Eye size={16} />
                  </Link>
                  <a href={`https://wa.me/${c.telephone.replace(/\s+/g, '')}`} target="_blank" className="p-2 hover:bg-green-500 hover:text-white rounded-lg transition-all">
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
