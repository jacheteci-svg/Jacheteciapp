'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import * as track from '@/lib/pixel/tracking'
import { X, CheckCircle2, ShoppingBag, Truck, Zap, Star, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrix } from '@/lib/utils/formatPrix'
import { cn } from '@/lib/utils/cn'

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
          track.trackPurchase(produit, formData.quantite, data.commandeId)

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
          
          setTimeout(() => {
            router.push(`/confirmation?id=${data.commandeId}`)
            onClose()
          }, 2000)
        }
      } catch (err) {
        alert("Une erreur est survenue. Veuillez réessayer.")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
         onClick={onClose}
      />
      
      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative glass w-full max-w-lg rounded-[3.5rem] shadow-[0_0_100px_-20px_rgba(45,212,191,0.2)] border-white/10 overflow-hidden"
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 glass rounded-2xl text-slate-400 hover:text-white hover:border-white/20 transition-all z-20"
        >
          <X size={20} strokeWidth={3} />
        </button>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-16 text-center space-y-8"
            >
              <div className="relative mx-auto w-32 h-32">
                 <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full animate-pulse" />
                 <div className="relative w-full h-full bg-brand-primary/10 text-brand-primary rounded-[2.5rem] flex items-center justify-center border border-brand-primary/20">
                    <CheckCircle2 size={72} strokeWidth={2} />
                 </div>
              </div>
              <div className="space-y-4">
                 <h2 className="text-4xl font-black text-white italic tracking-tighter">COMMANDE VALIDÉE !</h2>
                 <p className="text-slate-400 font-medium text-lg leading-relaxed">
                    Merci <span className="text-white">{formData.client_nom.split(' ')[0]}</span>. <br/>
                    Votre pépite est en route pour la livraison.
                 </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" className="flex flex-col">
              {/* Header */}
              <div className="bg-white/5 p-10 border-b border-white/5 flex items-center gap-6">
                  <div className="w-20 h-20 relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 shadow-2xl">
                    {produit.produit_photos?.[0]?.url ? (
                      <Image 
                        src={produit.produit_photos[0].url} 
                        alt={produit.nom} 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                         <ShoppingBag size={32} />
                      </div>
                    )}
                 </div>
                 <div className="space-y-1">
                    <h2 className="text-xl font-black text-white italic tracking-tighter leading-tight line-clamp-1 uppercase">{produit.nom}</h2>
                    <div className="flex items-center gap-3">
                       <p className="text-brand-primary font-black text-2xl tracking-tighter">{formatPrix(produit.prix)}</p>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5 px-2 py-0.5 rounded-md">1 UNITÉ</span>
                    </div>
                 </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-10 space-y-10">
                <div className="space-y-6">
                  <div className="space-y-3 px-2">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">NOM COMPLET</label>
                       {formData.client_nom.length > 3 && <Check size={12} className="text-brand-primary" strokeWidth={4} />}
                    </div>
                    <input 
                      required
                      className="w-full glass border-white/5 rounded-2xl px-6 py-5 focus:border-brand-primary/50 focus:bg-white/5 transition-all outline-none font-bold text-white placeholder:text-slate-700"
                      placeholder="Ex: Jean Kouassi"
                      value={formData.client_nom}
                      onChange={e => setFormData({...formData, client_nom: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-3 px-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">TÉLÉPHONE</label>
                        <input 
                          required
                          type="tel"
                          className="w-full glass border-white/5 rounded-2xl px-6 py-5 focus:border-brand-primary/50 focus:bg-white/5 transition-all outline-none font-bold text-white placeholder:text-slate-700"
                          placeholder="Ex: 07 00 00 00 00"
                          value={formData.client_tel}
                          onChange={e => setFormData({...formData, client_tel: e.target.value})}
                        />
                     </div>
                     <div className="space-y-3 px-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">QUARTIER / VILLE</label>
                        <input 
                          required
                          className="w-full glass border-white/5 rounded-2xl px-6 py-5 focus:border-brand-primary/50 focus:bg-white/5 transition-all outline-none font-bold text-white placeholder:text-slate-700"
                          placeholder="Ex: Cocody Angré"
                          value={formData.client_quartier}
                          onChange={e => setFormData({...formData, client_quartier: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="w-1/3 space-y-3 px-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">QTÉ</label>
                      <input 
                        type="number"
                        min="1"
                        className="w-full glass border-white/5 rounded-2xl px-6 py-5 focus:border-brand-primary/50 focus:bg-white/5 transition-all outline-none font-bold text-white"
                        value={formData.quantite}
                        onChange={e => setFormData({...formData, quantite: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    <div className="w-2/3 space-y-3 px-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">MODE PAIEMENT</label>
                      <select 
                        className="w-full glass border-white/5 rounded-2xl px-6 py-5 focus:border-brand-primary/50 focus:bg-white/5 transition-all outline-none font-bold text-white appearance-none cursor-pointer"
                        value={formData.paiement_mode}
                        onChange={e => setFormData({...formData, paiement_mode: e.target.value})}
                      >
                        <option value="livraison" className="bg-[#030712]">Cash Livraison</option>
                        <option value="wave" className="bg-[#030712]">Wave</option>
                        <option value="orange_money" className="bg-[#030712]">Orange Money</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <button 
                     disabled={isPending}
                     className={cn(
                        "w-full py-6 rounded-[2rem] font-black text-2xl italic tracking-tighter shadow-2xl transition-all flex items-center justify-center gap-4 relative overflow-hidden group",
                        isPending ? "bg-white/10 text-slate-600" : "bg-white text-black hover:scale-[1.02] active:scale-95 shadow-white/10"
                     )}
                   >
                     {isPending ? (
                       <>
                         <div className="w-6 h-6 border-4 border-black/10 border-t-black rounded-full animate-spin" />
                         CHARGEMENT...
                       </>
                     ) : (
                       <>
                         <ShoppingBag size={28} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
                         COMMANDER MAINTENANT
                       </>
                     )}
                   </button>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/5">
                         <Zap size={14} className="text-brand-secondary animate-pulse" /> STOCK LIMITÉ
                      </div>
                      <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/5">
                         <Truck size={14} className="text-brand-primary" /> LIVRAISON 24H
                      </div>
                   </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
