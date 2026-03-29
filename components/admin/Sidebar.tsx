'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  BarChart3,
  Globe,
  Truck,
  Tag,
  Menu,
  X,
  Sparkles
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Tableau de bord', icon: LayoutDashboard, href: '/admin' },
  { label: 'Commandes', icon: ShoppingCart, href: '/admin/commandes' },
  { label: 'Produits', icon: Package, href: '/admin/produits' },
  { label: 'Catégories', icon: Tag, href: '/admin/categories' },
  { label: 'Clients CRM', icon: Users, href: '/admin/clients' },
  { label: 'Marketing Pixel', icon: BarChart3, href: '/admin/pixel' },
  { label: 'Logistique', icon: Truck, href: '/admin/livraisons' },
  { label: 'Contenu Vitrine', icon: Globe, href: '/admin/contenu' },
  { label: 'Configuration', icon: Settings, href: '/admin/parametres' },
]

export default function Sidebar({ userName }: { userName?: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Close sidebar on navigation on mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Toggle Button */}
      {!isOpen && (
        <motion.button 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-6 left-6 z-[60] p-4 glass text-white rounded-[1.5rem] shadow-2xl shadow-brand-primary/20 border-white/10"
        >
          <Menu size={24} />
        </motion.button>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-[80] w-[280px] bg-background border-r border-white/5 flex flex-col h-screen transition-transform duration-500 ease-in-out lg:translate-x-0 lg:sticky lg:top-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Abstract Background for Sidebar */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
           <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-[60px]" />
           <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-secondary/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 p-10 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-4 group">
            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border-white/10 group-hover:scale-110 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(45,212,191,0.2)]">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex flex-col -space-y-1 text-left">
               <span className="text-2xl font-black text-white tracking-tighter italic">
                 Admin<span className="text-brand-primary">.ci</span>
               </span>
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">WORKSPACE</span>
            </div>
          </Link>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="px-6 py-4 mx-4 mb-8 glass rounded-[2rem] border-white/5 flex items-center gap-4 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-lg border border-brand-primary/20 shadow-inner">
              {userName?.charAt(0).toUpperCase() || 'A'}
           </div>
           <div className="flex-1 min-w-0 relative z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Session</p>
              <p className="text-sm font-black text-white truncate tracking-tight">{userName || 'Administrateur'}</p>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-5 py-3 rounded-2xl text-[13px] font-bold transition-all relative group",
                  isActive 
                    ? 'text-white glass-card border-brand-primary/20 bg-brand-primary/10 shadow-lg shadow-brand-primary/5' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute left-0 w-1 h-6 bg-brand-primary rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={20} className={cn("transition-colors", isActive ? "text-brand-primary" : "group-hover:text-slate-300")} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 relative z-10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/10"
          >
            <div className="p-2 glass rounded-lg border-red-500/10 text-red-500/60">
               <LogOut size={18} />
            </div>
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}

