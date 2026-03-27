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
  FileText
} from 'lucide-react'

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

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white">
          <Store size={18} />
        </div>
        <span className="text-xl font-black text-white tracking-tighter">
          Admin<span className="text-brand-secondary">.CI</span>
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
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
  )
}
