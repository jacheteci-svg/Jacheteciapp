'use client'

import { useState } from 'react'

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
    <div className="relative group w-full h-full">
      <img 
        src={photos[active].url} 
        alt="produit" 
        className="w-full h-full object-cover select-none"
      />
      
      {photos.length > 1 && (
        <>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1.5 bg-black/20 backdrop-blur-sm rounded-full">
            {photos.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActive(i)}
                className={`w-2 h-2 rounded-full transition-all ${active === i ? 'bg-white scale-125' : 'bg-white/40'}`}
              />
            ))}
          </div>
          
          <button 
            onClick={() => setActive(prev => prev > 0 ? prev - 1 : photos.length - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ←
          </button>
          <button 
             onClick={() => setActive(prev => prev < photos.length - 1 ? prev + 1 : 0)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            →
          </button>
        </>
      )}
    </div>
  )
}
