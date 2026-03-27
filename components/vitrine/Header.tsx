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
         <div className="flex items-center gap-6">
            <a 
              href="https://jachete.ci/shop/" 
              className="hidden lg:flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-brand-primary hover:text-white transition-all duration-300"
            >
               VOIR PLUS D'ARTICLES
            </a>
            <div className="flex flex-row items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
               <a href="tel:+2250172571352" className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2 hover:text-brand-primary transition-colors whitespace-nowrap">
                  <span className="w-2.5 h-2.5 bg-brand-primary rounded-full animate-pulse"></span>
                  +225 01 72 57 13 52
               </a>
               <span className="h-4 w-px bg-slate-200"></span>
               <a href="tel:+2250506844901" className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2 hover:text-brand-primary transition-colors whitespace-nowrap">
                  <span className="w-2.5 h-2.5 bg-brand-secondary rounded-full animate-pulse"></span>
                  +225 05 06 84 49 01
               </a>
            </div>
         </div>
      </div>
    </header>
  )
}
