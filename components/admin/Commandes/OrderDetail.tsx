'use client'

import { useState } from 'react'
import { formatPrix } from '@/lib/utils/formatPrix'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, Save, Phone, MapPin, Package, CreditCard } from 'lucide-react'

export default function OrderDetail({ order, zones, livreurs }: { order: any, zones: any[], livreurs: any[] }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [statut, setStatut] = useState(order.statut)
  const [zoneId, setZoneId] = useState(order.zone_id || '')
  const [livreurId, setLivreurId] = useState(order.livreur_id || '')

  const handleUpdate = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('commandes')
      .update({ statut, zone_id: zoneId || null, livreur_id: livreurId || null })
      .eq('id', order.id)
    
    if (error) alert(error.message)
    else alert("Mise à jour réussie !")
    setLoading(false)
  }

  const getWhatsAppTemplate = (type: string) => {
    const templates: any = {
      NOUVEAU: `Nous venons de recevoir votre commande et notre livreur va vous appeler pour vous livrer.`,
      CONFIRME: `Bonjour ${order.client_nom} ! Votre commande JACHETE.CI a été confirmée ✅ Livraison prévue dans votre zone (${order.client_quartier}) aujourd'hui ou demain. Le livreur vous appellera avant d'arriver. Merci de votre confiance ! 🙏`,
      EN_COURS: `Bonjour ${order.client_nom} ! Votre livreur est en route vers ${order.client_quartier} 🚚 Il vous appellera dans les prochaines minutes. Préparez ${formatPrix(order.montant_total)}. Merci !`,
      LIVRE: `Merci ${order.client_nom} pour votre commande JACHETE.CI ✅ Nous espérons que vous êtes satisfait(e) ! N'hésitez pas à nous faire un retour 😊`,
    }
    return encodeURIComponent(templates[type] || '')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Client & Shipping Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-orange-500">
                <Phone size={20} />
                <h3 className="font-bold uppercase text-xs tracking-widest text-slate-400">Client</h3>
              </div>
              <div>
                <p className="text-2xl font-black text-white">{order.client_nom}</p>
                <p className="text-orange-500 font-mono font-bold text-lg">{order.client_tel}</p>
              </div>
           </div>

            <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-orange-500">
                <MapPin size={20} />
                <h3 className="font-bold uppercase text-xs tracking-widest text-slate-400">Localisation</h3>
              </div>
              <div>
                <p className="text-xl font-black text-white uppercase">{order.client_quartier}</p>
                <p className="text-xs text-slate-500 font-medium">Zone de livraison assignée</p>
              </div>
           </div>
        </div>

        {/* Order Items */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
           <div className="flex items-center gap-3 text-orange-500 border-b border-slate-800 pb-4">
              <Package size={20} />
              <h3 className="font-bold uppercase text-xs tracking-widest text-slate-400">Articles</h3>
           </div>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center font-black text-slate-700">BOX</div>
                <div>
                  <p className="font-black text-white text-lg">{order.produits?.nom}</p>
                  <p className="text-slate-500 font-medium text-sm">Qté: {order.quantite}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-orange-500">{formatPrix(order.montant_total)}</p>
                <div className="flex items-center justify-end gap-1.5 text-slate-500 mt-1">
                  <CreditCard size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{order.paiement_mode.replace('_', ' ')}</span>
                </div>
              </div>
           </div>
        </div>

        {/* WhatsApp Actions */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
           <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageCircle size={24} className="text-green-500" />
              WhatsApp Client
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['NOUVEAU', 'CONFIRME', 'EN_COURS', 'LIVRE'].map((type) => (
                <a
                  key={type}
                  href={`https://wa.me/${order.client_tel.replace(/\s+/g, '')}?text=${getWhatsAppTemplate(type)}`}
                  target="_blank"
                  className="bg-[#0f172a] hover:bg-green-600 border border-slate-800 p-4 rounded-2xl text-center space-y-2 group transition-all"
                >
                  <p className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest">{type.replace('_', ' ')}</p>
                  <p className="text-xs font-bold text-slate-400 group-hover:text-green-100 line-clamp-2">Template pre-rempli</p>
                </a>
              ))}
           </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Status & Assignment Management */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Traitement</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Statut commande</label>
              <select 
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-bold"
                value={statut}
                onChange={e => setStatut(e.target.value)}
              >
                <option value="nouveau">Nouveau</option>
                <option value="confirme">Confirmé</option>
                <option value="en_cours">En cours de livraison</option>
                <option value="livre">Livré ✅</option>
                <option value="annule">Annulé ❌</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Zone de livraison</label>
              <select 
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-bold"
                value={zoneId}
                onChange={e => setZoneId(e.target.value)}
              >
                <option value="">Sélectionner une zone...</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.nom} (+{z.frais} FCFA)</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Livreur assigné</label>
              <select 
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-bold"
                value={livreurId}
                onChange={e => setLivreurId(e.target.value)}
              >
                <option value="">Sélectionner un livreur...</option>
                {livreurs.map(l => <option key={l.id} value={l.id}>{l.nom} ({l.telephone})</option>)}
              </select>
            </div>

            <button 
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? "Chargement..." : "METTRE À JOUR"}
            </button>
          </div>
        </div>

        {/* Notes Internal */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-4">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Notes internes</h3>
           <textarea 
             className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-slate-300 text-sm focus:border-orange-500 transition-all outline-none resize-none"
             rows={4}
             placeholder="Notes privées (non visible par le client)..."
           />
        </div>
      </div>
    </div>
  )
}
