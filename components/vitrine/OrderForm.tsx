'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as pixel from '@/lib/pixel/browser'
import { X, CheckCircle2, ShoppingBag } from 'lucide-react'

interface Props {
  produit: any
  selectedVariants?: Record<string, string>
  isOpen: boolean
  onClose: () => void
}

export default function OrderForm({ produit, selectedVariants, isOpen, onClose }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    client_nom: '',
    client_tel: '',
    client_quartier: '',
    paiement_mode: 'livraison',
    quantite: 1
  })

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

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
            montant_total: (produit.prix || 0) * formData.quantite,
            variants: selectedVariants
          })
        })
        
        const data = await res.json()
        
        if (data.success) {
          // Pixel Event
          pixel.event('Purchase', {
            value: (produit.prix || 0) * formData.quantite,
            currency: 'XOF',
            content_name: produit.nom,
            content_ids: [produit.id]
          })

          // CAPI Trigger
          await fetch('/api/pixel/capi', {
            method: 'POST',
            body: JSON.stringify({
              eventName: 'Purchase',
              eventId: data.eventId,
              produitId: produit.id,
              commandeId: data.commandeId,
              montant: (produit.prix || 0) * formData.quantite,
              clientTel: formData.client_tel
            })
          })

          setIsSuccess(true)
          
          // Small delay before redirect to show success state in modal
          setTimeout(() => {
            router.push(`/confirmation?id=${data.commandeId}`)
            onClose()
          }, 1500)
        }
      } catch (err) {
        alert("Une erreur est survenue. Veuillez réessayer.")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-brand-primary hover:text-white transition-all z-10"
        >
          <X size={20} strokeWidth={3} />
        </button>

        {isSuccess ? (
          <div className="p-12 text-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
               <CheckCircle2 size={64} strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
               <h2 className="text-3xl font-black text-slate-900 leading-tight">Commande Validée !</h2>
               <p className="text-slate-500 font-medium text-lg">Merci {formData.client_nom.split(' ')[0]}. Nous préparons votre colis.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-slate-50 p-8 border-b border-slate-100 flex items-center gap-4">
                <div className="w-16 h-16 relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  {produit.produit_photos?.[0]?.url ? (
                    <Image 
                      src={produit.produit_photos[0].url} 
                      alt={produit.nom} 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                       <ShoppingBag size={24} />
                    </div>
                  )}
               </div>
               <div>
                  <h2 className="text-lg font-black text-slate-900 leading-tight line-clamp-1">{produit.nom}</h2>
                  <p className="text-brand-primary font-black text-xl tracking-tighter">{formatPrix(produit.prix)}</p>
               </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Votre nom complet</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-brand-primary focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300"
                    placeholder="Ex: Jean Kouassi"
                    value={formData.client_nom}
                    onChange={e => setFormData({...formData, client_nom: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Votre téléphone</label>
                  <input 
                    required
                    type="tel"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-brand-primary focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300"
                    placeholder="Ex: 07 00 00 00 00"
                    value={formData.client_tel}
                    onChange={e => setFormData({...formData, client_tel: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Votre quartier / Ville</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-brand-primary focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300"
                    placeholder="Ex: Cocody Angré"
                    value={formData.client_quartier}
                    onChange={e => setFormData({...formData, client_quartier: e.target.value})}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/3 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Qté</label>
                    <input 
                      type="number"
                      min="1"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-brand-primary focus:bg-white transition-all outline-none font-bold text-slate-800"
                      value={formData.quantite}
                      onChange={e => setFormData({...formData, quantite: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="w-2/3 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Paiement</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 focus:border-brand-primary focus:bg-white transition-all outline-none font-bold text-slate-800"
                      value={formData.paiement_mode}
                      onChange={e => setFormData({...formData, paiement_mode: e.target.value})}
                    >
                      <option value="livraison">Cash Livraison</option>
                      <option value="wave">Wave</option>
                      <option value="orange_money">Orange Money</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                disabled={isPending}
                className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-primary/30 active:scale-95 transition-all text-xl tracking-tight disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
              >
                {isPending ? (
                  <>
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={24} strokeWidth={3} />
                    CONFIRMER L'ACHAT
                  </>
                )}
              </button>
              
              <div className="text-center space-y-1">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                   🤝 Paiement à la réception après vérification
                 </p>
                 <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">
                   🚚 Livraison GRATUITE dès 2 produits !
                 </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

import Image from 'next/image'
import { formatPrix } from '@/lib/utils/formatPrix'
