'use client'

import React, { useState } from 'react'
import { formatPrix } from '@/lib/utils/formatPrix'
import { Eye, MessageCircle, Trash2, CheckCircle2, Truck, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function OrderList({ orders: initialOrders }: { orders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const supabase = createClient()

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setLoadingId(id)
    const { error } = await supabase
      .from('commandes')
      .update({ statut: newStatus })
      .eq('id', id)

    if (error) {
      alert("Erreur lors de la mise à jour: " + error.message)
    } else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, statut: newStatus } : o))
    }
    setLoadingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette commande ?")) return
    
    setLoadingId(id)
    const { error } = await supabase
      .from('commandes')
      .delete()
      .eq('id', id)

    if (error) {
      alert("Erreur lors de la suppression: " + error.message)
    } else {
      setOrders(prev => prev.filter(o => o.id !== id))
    }
    setLoadingId(null)
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Aucune commande trouvée.
      </div>
    )
  }

  const whatsappMessage = encodeURIComponent("Nous venons de recevoir votre commande et notre livreur va vous appeler pour vous livrer.")

  return (
    <div className="space-y-4">
      {/* Table for Desktop */}
      <div className="hidden lg:block overflow-x-auto">
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
            {orders.map((o: any) => (
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
                  <StatusBadge statut={o.statut} />
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    {loadingId === o.id ? (
                      <div className="p-2"><Loader2 size={16} className="animate-spin text-orange-500" /></div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(o.id, 'en_traitement')}
                          title="En traitement"
                          className="p-2 bg-slate-800 hover:bg-blue-500 text-slate-400 hover:text-white rounded-lg transition-all"
                        >
                          <Clock size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(o.id, 'en_livraison')}
                          title="En livraison"
                          className="p-2 bg-slate-800 hover:bg-purple-500 text-slate-400 hover:text-white rounded-lg transition-all"
                        >
                          <Truck size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(o.id, 'livre')}
                          title="Livré"
                          className="p-2 bg-slate-800 hover:bg-green-500 text-slate-400 hover:text-white rounded-lg transition-all"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <div className="w-px h-6 bg-slate-700 mx-1 self-center" />
                        <Link href={`/admin/commandes/${o.id}`} className="p-2 bg-slate-800 hover:bg-orange-500 text-slate-400 hover:text-white rounded-lg transition-all">
                          <Eye size={16} />
                        </Link>
                        <a href={`https://wa.me/${o.client_tel.replace(/\s+/g, '')}?text=${whatsappMessage}`} target="_blank" className="p-2 bg-slate-800 hover:bg-green-500 text-slate-400 hover:text-white rounded-lg transition-all">
                          <MessageCircle size={16} />
                        </a>
                        <button 
                          onClick={() => handleDelete(o.id)}
                          className="p-2 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards for Mobile */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {orders.map((o: any) => (
          <div key={o.id} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-white font-black uppercase text-base tracking-tight">{o.client_nom}</p>
                <p className="text-xs text-slate-500 font-medium">{o.client_tel} • {o.client_quartier}</p>
              </div>
              <StatusBadge statut={o.statut} />
            </div>

            <div className="bg-slate-800/30 rounded-xl p-3 flex justify-between items-center">
               <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-300">{o.produits?.nom}</p>
                  <p className="text-[10px] text-slate-500">Qté: {o.quantite} • {new Date(o.created_at).toLocaleDateString('fr-FR')}</p>
               </div>
               <p className="text-lg font-black text-orange-500 tracking-tighter">{formatPrix(o.montant_total)}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/commandes/${o.id}`} className="flex-1 min-w-[120px] bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                <Eye size={16} /> Détails
              </Link>
              <a href={`https://wa.me/${o.client_tel.replace(/\s+/g, '')}?text=${whatsappMessage}`} target="_blank" className="flex-1 min-w-[120px] bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                <MessageCircle size={16} /> WhatsApp
              </a>
              <button 
                onClick={() => handleDelete(o.id)}
                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ statut }: { statut: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block ${
      statut === 'nouveau' || statut === 'en_attente' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
      statut === 'en_traitement' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
      statut === 'en_livraison' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
      statut === 'livre' || statut === 'confirme' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
      'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }`}>
      {statut.replace('_', ' ')}
    </span>
  )
}
