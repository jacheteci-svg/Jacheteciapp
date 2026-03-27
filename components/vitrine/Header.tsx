'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
           <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
              <ShoppingBag size={22} strokeWidth={2.5} />
           </div>
           <div className="flex flex-col -space-y-1">
              <span className="text-xl font-black text-slate-900 tracking-tighter">
                J'achète<span className="text-brand-secondary">.ci</span>
              </span>
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest text-center">SHOPPING</span>
           </div>
        </Link>

        {/* Support Mobile */}
        <div className="flex items-center gap-4">
           <a href="tel:+225000000000" className="bg-slate-50 text-slate-600 px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-100 transition-all hidden md:block">
              Besoin d'aide ?
           </a>
        </div>
      </div>
    </header>
  )
}
