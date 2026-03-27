'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import * as pixel from '@/lib/pixel/browser'

interface Props {
  produit: any
}

export default function OrderForm({ produit }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    client_nom: '',
    client_tel: '',
    client_quartier: '',
    paiement_mode: 'livraison',
    quantite: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    startTransition(async () => {
      try {
        const res = await fetch('/api/commandes', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            produit_id: produit.id,
            nom_produit: produit.nom,
            montant_total: produit.prix * formData.quantite
          })
        })
        
        const data = await res.json()
        
        if (data.success) {
          // Pixel Event
          pixel.event('Purchase', {
            value: produit.prix * formData.quantite,
            currency: 'XOF',
            content_name: produit.nom,
            content_ids: [produit.id]
          })

          // CAPI Trigger (via background API call if needed, or already handled in /api/commandes)
          await fetch('/api/pixel/capi', {
            method: 'POST',
            body: JSON.stringify({
              eventName: 'Purchase',
              eventId: data.eventId,
              produitId: produit.id,
              commandeId: data.commandeId,
              montant: produit.prix * formData.quantite,
              clientTel: formData.client_tel
            })
          })

          router.push(`/confirmation?id=${data.commandeId}`)
        }
      } catch (err) {
        alert("Une erreur est survenue. Veuillez réessayer.")
      }
    })
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-brand-primary/5 border border-brand-primary/10">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-800">Commander maintenant</h2>
        <p className="text-slate-500 font-medium">Livraison à domicile rapide 🚚</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Votre nom complet *</label>
          <input 
            required
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-brand-primary focus:bg-white transition-all outline-none"
            placeholder="Ex: Jean Kouassi"
            value={formData.client_nom}
            onChange={e => setFormData({...formData, client_nom: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Votre numéro de téléphone *</label>
          <input 
            required
            type="tel"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-brand-primary focus:bg-white transition-all outline-none"
            placeholder="Ex: 07 00 00 00 00"
            value={formData.client_tel}
            onChange={e => setFormData({...formData, client_tel: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Votre quartier / zone *</label>
          <input 
            required
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-brand-primary focus:bg-white transition-all outline-none"
            placeholder="Ex: Cocody Angré"
            value={formData.client_quartier}
            onChange={e => setFormData({...formData, client_quartier: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Quantité</label>
            <input 
              type="number"
              min="1"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-brand-primary focus:bg-white transition-all outline-none"
              value={formData.quantite}
              onChange={e => setFormData({...formData, quantite: parseInt(e.target.value) || 1})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Mode de paiement</label>
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-2 py-3 focus:border-brand-primary focus:bg-white transition-all outline-none"
              value={formData.paiement_mode}
              onChange={e => setFormData({...formData, paiement_mode: e.target.value})}
            >
              <option value="livraison">Cash à la livraison</option>
              <option value="wave">Wave</option>
              <option value="orange_money">Orange Money</option>
            </select>
          </div>
        </div>

        <button 
          disabled={isPending}
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black py-5 rounded-2xl shadow-lg shadow-brand-primary/30 active:scale-95 transition-all text-xl uppercase tracking-widest disabled:opacity-50 mt-4"
        >
          {isPending ? "Traitement en cours..." : "✅ CONFIRMER MA COMMANDE"}
        </button>
        
        <p className="text-center text-xs text-slate-400 font-medium italic">
          Garantie satisfaction - Paiement après réception
        </p>
      </form>
    </div>
  )
}
