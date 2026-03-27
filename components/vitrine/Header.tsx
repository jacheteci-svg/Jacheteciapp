'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100/50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
           <div className="relative w-12 h-12 md:w-14 md:h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-primary/20 group-hover:rotate-12 transition-transform duration-500">
              J
           </div>
           <div className="flex flex-col -space-y-1 hidden sm:flex">
              <span className="text-2xl font-black text-slate-900 tracking-tighter">
                J'achète<span className="text-brand-secondary">.ci</span>
              </span>
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest text-center">SHOPPING PREMIUM</span>
           </div>
        </Link>

        {/* Support & Admin */}
        <div className="flex items-center gap-3">
           <a 
             href="https://jachete.ci/shop/" 
             className="hidden sm:flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-brand-primary hover:text-white transition-all duration-300"
           >
              VOIR PLUS D'ARTICLES
           </a>
           <a href="tel:+225000000000" className="bg-slate-50 text-slate-600 px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-100 transition-all">
              Besoin d'aide ?
           </a>
        </div>
      </div>
    </header>
  )
}
