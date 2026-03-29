'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { formatPrix } from '@/lib/utils/formatPrix'
import { cn } from '@/lib/utils/cn'
import { motion } from 'framer-motion'
import { ShoppingBag, Calendar, MapPin, Eye } from 'lucide-react'
import Link from 'next/link'

export default function RecentOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)
      
      if (data) setOrders(data)
      setLoading(false)
    }
    fetchOrders()
  }, [])

  if (loading) return <div className="h-64 glass animate-pulse rounded-[2.5rem]" />

  if (orders.length === 0) {
    return (
      <div className="glass p-12 text-center rounded-[2.5rem] border-dashed border-2 border-white/5">
        <ShoppingBag className="mx-auto text-slate-800 mb-4" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Aucune commande récente</p>
      </div>
    )
  }

  const getStatusStyle = (statut: string) => {
    switch (statut) {
      case 'en attente': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'confirmé': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'livré': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'annulé': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'retour': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  return (
    <div className="glass rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl shadow-black/40">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Client</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Zone</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Statut</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order, i) => (
              <motion.tr 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={order.id} 
                className="hover:bg-white/[0.03] transition-colors group cursor-default"
              >
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white tracking-tight group-hover:text-brand-primary transition-colors">
                      {order.client_nom}
                    </span>
                    <span className="text-[10px] font-medium text-slate-600 uppercase tracking-widest mt-1 flex items-center gap-1">
                       <Calendar size={10} /> {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                      <MapPin size={12} className="text-slate-600" />
                      {order.client_quartier || 'Abidjan'}
                   </span>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border shadow-lg",
                    getStatusStyle(order.statut)
                  )}>
                    {order.statut}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-sm font-black text-white tracking-tighter mr-2">
                      {formatPrix(order.montant_total)}
                    </span>
                    <Link 
                      href={`/admin/commandes/${order.id}`}
                      className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    >
                      <Eye size={16} />
                    </Link>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
