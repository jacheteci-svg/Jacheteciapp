
'use client'

import { useState, useMemo, useEffect } from 'react'
import { ShoppingBag, Star, Zap, Check, ChevronRight } from 'lucide-react'
import OrderForm from './OrderForm'
import { formatPrix } from '@/lib/utils/formatPrix'
import * as track from '@/lib/pixel/tracking'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

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
      <div className="space-y-10">
        
        {/* Variant Selection UI */}
        {variantNames.length > 0 && (
          <div className="space-y-8">
            {variantNames.map(name => (
              <div key={name} className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">CHOISIR {name}</label>
                  <AnimatePresence>
                    {selectedVariants[name] && (
                      <motion.span 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] font-black text-brand-primary uppercase flex items-center gap-2"
                      >
                        <Check size={12} strokeWidth={4} /> {selectedVariants[name]}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex flex-wrap gap-3">
                  {variantsByName[name].map((v: any) => {
                    const isSelected = selectedVariants[name] === v.value
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariant(name, v.value)}
                        className={cn(
                          "relative px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border overflow-hidden",
                          isSelected
                            ? 'bg-brand-primary border-brand-primary text-white shadow-2xl shadow-brand-primary/40 scale-105'
                            : 'glass border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                        )}
                      >
                        {isSelected && (
                          <motion.div 
                            layoutId={`${name}-active`}
                            className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" 
                          />
                        )}
                        <span className="relative z-10">{v.value}</span>
                        {v.price_override && (
                          <span className={cn(
                             "block text-[8px] mt-1 italic tracking-normal font-bold",
                             isSelected ? "text-white/60" : "text-brand-primary"
                          )}>
                            + {formatPrix(v.price_override - produit.prix)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Price Display */}
        {variantNames.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 pt-8 border-t border-white/5"
            >
               <div className="flex flex-col">
                  <span className="text-4xl font-black text-white tracking-tighter italic">
                     {formatPrix(currentPrice)}
                  </span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">PRIX DE VOTRE SÉLECTION</span>
               </div>
            </motion.div>
        )}

        {/* Main CTA Button */}
        <div className="space-y-6">
          <motion.button 
            whileHover={isAllSelected || variantNames.length === 0 ? { scale: 1.02 } : {}}
            whileTap={isAllSelected || variantNames.length === 0 ? { scale: 0.98 } : {}}
            onClick={() => {
              if (isAllSelected || variantNames.length === 0) {
                setIsModalOpen(true)
                track.trackAddToCart(produit)
              }
            }}
            className={cn(
              "w-full py-7 rounded-[2.5rem] font-black text-2xl tracking-tighter shadow-2xl transition-all flex items-center justify-center gap-4 group relative overflow-hidden italic",
              isAllSelected || variantNames.length === 0
                ? 'bg-white text-black shadow-white/10 hover:shadow-white/20'
                : 'glass border-white/5 text-slate-600 cursor-not-allowed opacity-50'
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <ShoppingBag size={28} strokeWidth={3} className="group-hover:rotate-12 transition-transform duration-500" />
            {isAllSelected || variantNames.length === 0 ? 'VALIDER MA COMMANDE' : 'CHOISIR OPTIONS'}
          </motion.button>

          {/* Rassurance Tags */}
          <div className="flex flex-wrap gap-4 justify-center items-center">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest glass px-4 py-2 rounded-full border-white/5">
                <Zap size={14} className="text-brand-secondary animate-pulse" /> STOCK TRÈS LIMITÉ
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest glass px-4 py-2 rounded-full border-white/5">
                <Star size={14} className="text-brand-primary" fill="currentColor" /> SÉLECTION PREMIUM
             </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-6 bg-[#030712]/80 backdrop-blur-3xl border-t border-white/5 z-40 lg:hidden"
        >
           <button 
             onClick={() => setIsModalOpen(true)}
             disabled={!(isAllSelected || variantNames.length === 0)}
             className={cn(
               "w-full py-6 rounded-[2rem] font-black text-xl italic tracking-tighter shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95",
               isAllSelected || variantNames.length === 0
                 ? 'bg-white text-black shadow-white/5'
                 : 'glass border-white/5 text-slate-700'
             )}
           >
             <ShoppingBag size={24} strokeWidth={3} />
             {isAllSelected || variantNames.length === 0 ? 'ACHETER MAINTENANT' : 'CHOISIR OPTIONS'}
             <ChevronRight size={20} strokeWidth={3} className="ml-2" />
           </button>
        </motion.div>
      </AnimatePresence>

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
