'use client'

import { useState } from 'react'
import { ShoppingBag, Star, Zap } from 'lucide-react'
import OrderForm from './OrderForm'

interface Props {
  produit: any
}

export default function ProductActions({ produit }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="space-y-6">
        {/* Main CTA Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-brand-primary text-white py-6 rounded-[2rem] font-black text-2xl shadow-xl shadow-brand-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group animate-pulse-slow"
        >
          <ShoppingBag size={28} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
          COMMANDER MAINTENANT
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

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-40 md:hidden animate-in slide-in-from-bottom-full duration-500 ease-out">
         <button 
           onClick={() => setIsModalOpen(true)}
           className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
         >
           <ShoppingBag size={24} strokeWidth={3} />
           ACHETER MAINTENANT
         </button>
      </div>

      {/* The Modal Order Form */}
      <OrderForm 
        produit={produit} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
