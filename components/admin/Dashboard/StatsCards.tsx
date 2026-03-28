'use client'

import { ShoppingCart, DollarSign, TrendingUp, Users } from 'lucide-react'
import { formatPrix } from '@/lib/utils/formatPrix'

export default function StatsCards({ data }: { data?: any }) {
  const stats = [
    { 
      label: "Chiffre d'Affaire", 
      value: formatPrix(data?.revenue || 0), 
      icon: DollarSign, 
      color: "bg-green-500", 
      trend: "Total livré" 
    },
    { 
      label: "Commandes (Jour)", 
      value: data?.todayOrders?.toString() || "0", 
      icon: ShoppingCart, 
      color: "bg-blue-500", 
      trend: "Aujourd'hui" 
    },
    { 
      label: "Taux de Succès", 
      value: `${data?.successRate || 100}%`, 
      icon: TrendingUp, 
      color: "bg-orange-500", 
      trend: "Logistique" 
    },
    { 
      label: "Total Commandes", 
      value: data?.totalOrders?.toString() || "0", 
      icon: Users, 
      color: "bg-purple-500", 
      trend: "Historique" 
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-slate-700 transition-colors group">
          <div className="flex items-center justify-between">
            <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
              <stat.icon size={24} />
            </div>
            <span className="text-xs font-black text-slate-500 font-mono uppercase tracking-tighter bg-slate-800 px-2 py-1 rounded-lg group-hover:text-slate-100 transition-colors">
              {stat.trend}
            </span>
          </div>
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  )
}
