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
  MessageCircle,
  Tag,
  Store,
  FileText,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { label: 'Tableau de bord', icon: LayoutDashboard, href: '/admin' },
  { label: 'Commandes', icon: ShoppingCart, href: '/admin/commandes' },
  { label: 'Produits', icon: Package, href: '/admin/produits' },
  { label: 'Clients CRM', icon: Users, href: '/admin/clients' },
  { label: 'Pixel & Marketing', icon: BarChart3, href: '/admin/pixel' },
  { label: 'Zones & Livraison', icon: Truck, href: '/admin/livraisons' },
  { label: 'Contenu Site', icon: Globe, href: '/admin/contenu' },
  { label: 'Paramètres', icon: Settings, href: '/admin/parametres' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-[#0f172a] border-r border-slate-800 flex flex-col h-screen transition-transform duration-500 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-black text-white tracking-tighter">
              Admin<span className="text-brand-secondary">.CI</span>
            </span>
          </div>
          
          {/* Close button on mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
