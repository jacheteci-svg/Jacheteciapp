'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 py-4 md:px-8",
      scrolled ? "pt-4" : "pt-6 md:pt-8"
    )}>
      <div className={cn(
        "container mx-auto max-w-7xl h-20 flex items-center justify-between px-6 rounded-[2.5rem] transition-all duration-500 border border-transparent",
        scrolled ? "glass shadow-2xl shadow-black/50 border-white/5" : "bg-white/5 border-white/[0.03] backdrop-blur-md"
      )}>
        <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
               <Image 
                 src="/logo.png" 
                 alt="J'achète.ci Logo" 
                 width={48} 
                 height={48} 
                 className="object-contain"
                 priority
               />
            </div>
            <div className="flex flex-col -space-y-1">
               <span className="text-xl md:text-2xl font-black text-white tracking-tighter italic">
                 J'achète<span className="text-brand-primary">.ci</span>
               </span>
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] overflow-hidden whitespace-nowrap">PREMIUM SELECTION</span>
            </div>
        </Link>

        {/* Support & CTA */}
         <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:flex items-center gap-4 glass px-6 py-2.5 rounded-2xl border-white/5 shadow-sm">
               <a href="tel:+2250172571352" className="text-xs font-black text-slate-300 flex items-center gap-2 hover:text-brand-primary transition-colors whitespace-nowrap">
                  <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
                  +225 01 72 57 13 52
               </a>
               <span className="h-4 w-px bg-white/10"></span>
               <a href="tel:+2250506844901" className="text-xs font-black text-slate-300 flex items-center gap-2 hover:text-brand-primary transition-colors whitespace-nowrap">
                  <span className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse"></span>
                  +225 05 06 84 49 01
               </a>
            </div>

            <a 
              href="https://jachete.ci/shop/" 
              className="bg-white text-background px-6 py-3 rounded-2xl text-[10px] font-black hover:bg-brand-primary hover:text-white transition-all duration-300 flex items-center gap-2 shadow-lg shadow-white/5"
            >
               EXPLORER <ChevronRight size={14} strokeWidth={3} />
            </a>
         </div>
      </div>
    </header>
  )
}

