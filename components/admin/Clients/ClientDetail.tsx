'use client'

import { formatPrix } from '@/lib/utils/formatPrix'
import { MessageCircle, Save, Phone, MapPin, Package, Calendar } from 'lucide-react'

export default function ClientDetail({ client, orders }: { client: any, orders: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Client Stats Overlay */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dépense Totale</p>
              <p className="text-2xl font-black text-orange-500">{formatPrix(client.total_depense)}</p>
           </div>
           <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Commandes</p>
              <p className="text-2xl font-black text-white">{client.total_commandes}</p>
           </div>
           <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quartier</p>
              <p className="text-lg font-black text-white uppercase truncate">{client.quartier || 'Non défini'}</p>
           </div>
        </div>

        {/* Purchase History */}
        <div className="space-y-4">
           <h2 className="text-xl font-bold text-white px-2 mt-4">Historique des commandes</h2>
           <div className="bg-[#1e293b] border border-slate-800 rounded-3xl overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-[#0f172a]/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <tr>
                       <th className="p-4">Date</th>
                       <th className="p-4">Produit</th>
                       <th className="p-4 text-right">Montant</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800 transition-all">
                    {orders.map((o) => (
                       <tr key={o.id} className="hover:bg-slate-800/30">
                          <td className="p-4 text-xs font-mono text-slate-400">
                             {new Date(o.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="p-4">
                             <p className="text-sm font-bold text-white">{o.produits?.nom}</p>
                             <span className="text-[9px] font-black uppercase text-slate-500 px-1.5 py-0.5 bg-slate-800 rounded">{o.statut}</span>
                          </td>
                          <td className="p-4 text-right font-bold text-orange-400">
                             {formatPrix(o.montant_total)}
                          </td>
                       </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-600">Aucun historique.</td></tr>}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Actions & CRM Status */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
           <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
              <MapPin size={18} className="text-orange-500" />
              CRM & Actions
           </h2>
           
           <div className="space-y-4">
              <a 
                href={`https://wa.me/${client.telephone.replace(/\s+/g, '')}`} 
                target="_blank"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-3 transition-all"
              >
                <MessageCircle size={20} />
                CONTACTER SUR WA
              </a>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Attribuer Statut</label>
                <select className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-orange-500">
                   <option value="nouveau">Nouveau</option>
                   <option value="regulier">Régulier</option>
                   <option value="vip">VIP 🌟</option>
                   <option value="blackliste">Blacklisté 🚫</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Notes Client</label>
                <textarea 
                   className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-slate-300 text-xs focus:border-orange-500 outline-none resize-none"
                   rows={6}
                   defaultValue={client.notes || ''}
                   placeholder="Préférences de livraison, fidélité..."
                />
              </div>

              <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                 <Save size={18} />
                 Sauvegarder
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
