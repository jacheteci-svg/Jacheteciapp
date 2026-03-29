'use client'

import { formatPrix } from '@/lib/utils/formatPrix'
import { Edit, Trash2, Eye, Package, AlertCircle, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export default function ProductList({ 
  produits, 
  onEdit, 
  onDelete 
}: { 
  produits: any[], 
  onEdit: (p: any) => void,
  onDelete: (id: string) => void
}) {
  if (produits.length === 0) {
    return (
      <div className="p-20 text-center space-y-4">
        <ShoppingBag className="mx-auto text-slate-800" size={64} />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Aucun produit dans le catalogue</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.02]">
            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Produit</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Catégorie</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Prix</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Inventaire</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {produits.map((p, i) => {
            const mainPhoto = p.produit_photos?.find((ph: any) => ph.est_principale)?.url || p.produit_photos?.[0]?.url
            const lowStock = p.quantite <= (p.seuil_alerte || 5)
            
            return (
              <motion.tr 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                key={p.id} 
                className="hover:bg-white/[0.03] transition-colors group cursor-default"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.2rem] bg-white/5 overflow-hidden border border-white/10 relative shadow-xl shadow-black/20 shrink-0">
                      {mainPhoto ? (
                        <img src={mainPhoto} alt={p.nom} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                          <Package size={24} />
                        </div>
                      )}
                      {!p.actif && (
                         <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="text-[8px] font-black text-white px-2 py-0.5 border border-white/20 rounded-full uppercase tracking-tighter">Inactif</span>
                         </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-base font-black text-white tracking-tight group-hover:text-brand-primary transition-colors truncate">
                        {p.nom}
                      </span>
                      <span className="text-[10px] font-medium text-slate-600 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                         ID: {p.slug?.substring(0, 20)}...
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="bg-white/5 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-white/5">
                    {p.categories?.name || 'Général'}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-base font-black text-brand-primary tracking-tighter font-mono">
                      {formatPrix(p.prix)}
                    </span>
                    {p.prix_barre && (
                      <span className="text-[10px] text-slate-600 line-through font-bold">
                        {formatPrix(p.prix_barre)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border-2",
                      lowStock ? "bg-brand-secondary/10 text-brand-secondary border-brand-secondary/30 scale-105 shadow-lg shadow-brand-secondary/10" : "bg-green-500/5 text-green-400 border-green-500/10"
                    )}>
                       <span className="text-lg font-black tabular-nums">{p.quantite}</span>
                       {lowStock && <AlertCircle size={16} strokeWidth={3} className="animate-pulse" />}
                    </div>
                    {lowStock && (
                      <span className="text-[8px] font-black text-brand-secondary uppercase tracking-tighter animate-pulse">STOCK CRITIQUE</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={() => onEdit(p)}
                      className="p-3 bg-white/5 hover:bg-brand-primary text-slate-400 hover:text-background rounded-xl transition-all border border-white/5"
                    >
                      <Edit size={16} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => onDelete(p.id)}
                      className="p-3 bg-white/5 hover:bg-brand-secondary text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
                    >
                       <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

