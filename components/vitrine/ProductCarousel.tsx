'use client'

import { useState } from 'react'
import Zoom from 'react-medium-image-zoom'
import { Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProductCarousel({ photos }: { photos: any[] }) {
  const [active, setActive] = useState(0)

  if (photos.length === 0) {
    return (
      <div className="w-full aspect-[4/5] bg-slate-900/50 flex flex-col items-center justify-center text-slate-500 gap-4">
        <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center">
           <Maximize2 size={32} className="opacity-20" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Visuel non disponible</span>
      </div>
    )
  }

  return (
    <div className="relative group w-full aspect-[4/5] bg-[#0a0a0a] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full"
        >
          <Zoom>
            <img 
              src={photos[active].url} 
              alt="produit" 
              className="w-full h-full object-cover select-none cursor-zoom-in"
            />
          </Zoom>
        </motion.div>
      </AnimatePresence>

      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Floating Indicators */}
      <div className="absolute top-8 left-8 z-10 glass px-4 py-2 rounded-full border-white/10 text-[10px] font-black text-white/50 tracking-widest uppercase">
         {active + 1} <span className="mx-1 text-white/20">/</span> {photos.length}
      </div>

      <div className="absolute top-8 right-8 z-10 glass p-3 rounded-2xl border-white/10 text-white shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
         <Maximize2 size={20} strokeWidth={2.5} />
      </div>
      
      {photos.length > 1 && (
        <>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 px-5 py-3 glass rounded-full z-20 border-white/5 shadow-2xl backdrop-blur-2xl">
            {photos.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActive(i)}
                className={`transition-all duration-500 ${active === i ? 'bg-brand-primary w-8 h-1.5 rounded-full' : 'bg-white/20 w-1.5 h-1.5 rounded-full hover:bg-white/40'}`}
              />
            ))}
          </div>
          
          <button 
            onClick={() => setActive(prev => prev > 0 ? prev - 1 : photos.length - 1)}
            className="absolute left-6 top-1/2 -translate-y-1/2 glass w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-2xl md:opacity-0 md:group-hover:opacity-100 transition-all active:scale-90 z-20 text-white border-white/5 hover:border-white/20 hover:bg-white/5"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <button 
             onClick={() => setActive(prev => prev < photos.length - 1 ? prev + 1 : 0)}
            className="absolute right-6 top-1/2 -translate-y-1/2 glass w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-2xl md:opacity-0 md:group-hover:opacity-100 transition-all active:scale-90 z-20 text-white border-white/5 hover:border-white/20 hover:bg-white/5"
          >
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        </>
      )}
    </div>
  )
}
