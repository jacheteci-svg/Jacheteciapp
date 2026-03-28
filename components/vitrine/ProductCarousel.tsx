'use client'

import { useState } from 'react'
import Zoom from 'react-medium-image-zoom'
import { Maximize2 } from 'lucide-react'

export default function ProductCarousel({ photos }: { photos: any[] }) {
  const [active, setActive] = useState(0)

  if (photos.length === 0) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
        Pas de photo disponible
      </div>
    )
  }

  return (
    <div className="relative group w-full aspect-[4/5] bg-slate-50 overflow-hidden">
      <Zoom>
        <img 
          src={photos[active].url} 
          alt="produit" 
          className="w-full h-full object-cover select-none transition-all duration-700 ease-out cursor-zoom-in"
        />
      </Zoom>

      <div className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
         <Maximize2 size={16} className="text-slate-600" />
      </div>
      
      {photos.length > 1 && (
        <>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 bg-black/30 backdrop-blur-md rounded-full z-20">
            {photos.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActive(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${active === i ? 'bg-white w-4' : 'bg-white/40'}`}
              />
            ))}
          </div>
          
          <button 
            onClick={() => setActive(prev => prev > 0 ? prev - 1 : photos.length - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl md:opacity-0 md:group-hover:opacity-100 transition-all active:scale-95 z-20 text-slate-900 font-bold"
          >
            ←
          </button>
          <button 
             onClick={() => setActive(prev => prev < photos.length - 1 ? prev + 1 : 0)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl md:opacity-0 md:group-hover:opacity-100 transition-all active:scale-95 z-20 text-slate-900 font-bold"
          >
            →
          </button>
        </>
      )}
    </div>
  )
}
