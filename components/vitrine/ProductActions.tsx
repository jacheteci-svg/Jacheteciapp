
'use client'

import { useState, useMemo, useEffect } from 'react'
import { ShoppingBag, Star, Zap, Check } from 'lucide-react'
import OrderForm from './OrderForm'
import { formatPrix } from '@/lib/utils/formatPrix'
import * as track from '@/lib/pixel/tracking'

interface Props {
  produit: any
}

export default function ProductActions({ produit }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  // Track ViewContent on mount
  useEffect(() => {
    track.trackViewContent(produit)
  }, [produit])

  // Group variants by name (e.g., "Couleur", "Taille")
  const variantsByName = useMemo(() => {
    return produit.product_variants?.reduce((acc: any, v: any) => {
      if (!acc[v.name]) acc[v.name] = []
      acc[v.name].push(v)
      return acc
    }, {}) || {}
  }, [produit.product_variants])

  const variantNames = Object.keys(variantsByName)

  // Calculate current price based on selected variants (if override exists)
  const currentPrice = useMemo(() => {
    let price = produit.prix
    // For simplicity, we take the last selected variant's price override if it exists
    Object.entries(selectedVariants).forEach(([name, value]) => {
      const v = variantsByName[name]?.find((variant: any) => variant.value === value)
      if (v?.price_override) price = v.price_override
    })
    return price
  }, [selectedVariants, produit.prix, variantsByName])

  const handleSelectVariant = (name: string, value: string) => {
    setSelectedVariants(prev => ({ ...prev, [name]: value }))
  }

  const isAllSelected = variantNames.every(name => selectedVariants[name])

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Variant Selection UI */}
        {variantNames.length > 0 && (
          <div className="space-y-6">
            {variantNames.map(name => (
              <div key={name} className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sélectionner {name}</label>
                  {selectedVariants[name] && (
                    <span className="text-[10px] font-black text-brand-primary uppercase flex items-center gap-1">
                      <Check size={12} strokeWidth={3} /> {selectedVariants[name]}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {variantsByName[name].map((v: any) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVariant(name, v.value)}
                      className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                        selectedVariants[name] === v.value
                          ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/25 scale-105'
                          : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {v.value}
                      {v.price_override && (
                        <span className="block text-[8px] opacity-70 mt-1">
                          {formatPrix(v.price_override)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Price Display (Internal to actions for better flow) */}
        {variantNames.length > 0 && (
            <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
               <span className="text-3xl font-black text-brand-primary tracking-tighter">
                  {formatPrix(currentPrice)}
               </span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prix final</span>
            </div>
        )}

        {/* Main CTA Button */}
        <div className="space-y-4">
          <button 
            onClick={() => {
              setIsModalOpen(true)
              track.trackAddToCart(produit)
            }}
            className={`w-full py-6 rounded-[2rem] font-black text-2xl shadow-xl transition-all flex items-center justify-center gap-3 group ${
              isAllSelected || variantNames.length === 0
                ? 'bg-brand-primary text-white shadow-brand-primary/25 hover:scale-[1.02] active:scale-95 animate-pulse-slow'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag size={28} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
            {isAllSelected || variantNames.length === 0 ? 'COMMANDER MAINTENANT' : 'CHOISIR VOS OPTIONS'}
          </button>

          {/* Rassurance Tags */}
          <div className="flex flex-wrap gap-3 justify-center">
             <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <Zap size={14} className="text-orange-500" /> Stock Limité
             </div>
             <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <Star size={14} className="text-brand-secondary" /> Qualité Premium
             </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-40 md:hidden animate-in slide-in-from-bottom-full duration-500 ease-out">
         <button 
           onClick={() => setIsModalOpen(true)}
           disabled={!(isAllSelected || variantNames.length === 0)}
           className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
              isAllSelected || variantNames.length === 0
                ? 'bg-brand-primary text-white shadow-brand-primary/20'
                : 'bg-slate-200 text-slate-400'
           }`}
         >
           <ShoppingBag size={24} strokeWidth={3} />
           {isAllSelected || variantNames.length === 0 ? 'ACHETER MAINTENANT' : 'CHOISIR OPTIONS'}
         </button>
      </div>

      {/* The Modal Order Form */}
      <OrderForm 
        produit={{ ...produit, prix: currentPrice }} 
        selectedVariants={selectedVariants}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
