'use client'

import { formatPrix } from '@/lib/utils/formatPrix'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

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
      <div className="p-12 text-center text-slate-500 font-medium">
        Aucun produit trouvé.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto text-xs md:text-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-800/30">
            <th className="p-4 font-black text-slate-400 uppercase tracking-widest">Photo</th>
            <th className="p-4 font-black text-slate-400 uppercase tracking-widest">Nom</th>
            <th className="p-4 font-black text-slate-400 uppercase tracking-widest text-center">Catégorie</th>
            <th className="p-4 font-black text-slate-400 uppercase tracking-widest text-center">Prix</th>
            <th className="p-4 font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
            <th className="p-4 font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {(produits || []).map((p: any) => {
            const mainPhoto = p.produit_photos?.find((ph: any) => ph.est_principale)?.url || p.produit_photos?.[0]?.url
            return (
              <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="p-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                    {mainPhoto ? (
                      <img src={mainPhoto} alt={p.nom} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">N/A</div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-bold text-white group-hover:text-orange-400 transition-colors">{p.nom}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.slug}</p>
                </td>
                <td className="p-4 text-center">
                  <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {p.categories?.name || 'Sans catégorie'}
                  </span>
                </td>
                <td className="p-4 text-center">
                   <p className="font-bold text-orange-500">{formatPrix(p.prix)}</p>
                   {p.prix_barre && <p className="text-[10px] text-slate-500 line-through">{formatPrix(p.prix_barre)}</p>}
                </td>
                <td className="p-4 text-center">
                   <div className="flex flex-col items-center gap-1">
                      <span className={`font-mono text-sm font-bold ${p.quantite <= (p.seuil_alerte || 5) ? 'text-red-400' : 'text-green-400'}`}>
                        {p.quantite}
                      </span>
                      {p.quantite <= (p.seuil_alerte || 5) && <span className="bg-red-400/10 text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-tighter">ALERTE</span>}
                   </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit(p)}
                      className="p-2 bg-slate-800 hover:bg-orange-500 text-slate-400 hover:text-white rounded-lg transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(p.id)}
                      className="p-2 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-lg transition-all"
                    >
                       <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
