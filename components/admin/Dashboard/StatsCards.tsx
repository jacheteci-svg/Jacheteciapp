'use client'

import { ShoppingCart, DollarSign, TrendingUp, Users, ArrowUpRight } from 'lucide-react'
import { formatPrix } from '@/lib/utils/formatPrix'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export default function StatsCards({ data }: { data?: any }) {
  const stats = [
    { 
      label: "Chiffre d'Affaires", 
      value: formatPrix(data?.revenue || 0), 
      icon: DollarSign, 
      color: "text-brand-primary", 
      bg: "bg-brand-primary/10",
      border: "border-brand-primary/20",
      trend: "+12.5%",
      subtext: "Total livré" 
    },
    { 
      label: "Commandes Jour", 
      value: data?.todayOrders?.toString() || "0", 
      icon: ShoppingCart, 
      color: "text-accent-blue", 
      bg: "bg-accent-blue/10",
      border: "border-accent-blue/20",
      trend: "Aujourd'hui",
      subtext: "Flux entrant" 
    },
    { 
      label: "Taux de Succès", 
      value: `${data?.successRate || 100}%`, 
      icon: TrendingUp, 
      color: "text-brand-secondary", 
      bg: "bg-brand-secondary/10",
      border: "border-brand-secondary/20",
      trend: "Elite",
      subtext: "Logistique" 
    },
    { 
      label: "Total Commandes", 
      value: data?.totalOrders?.toString() || "0", 
      icon: Users, 
      color: "text-purple-400", 
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
      trend: "Volume",
      subtext: "Historique" 
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          key={i} 
          className="glass p-6 rounded-[2rem] border-white/5 space-y-6 hover:border-white/10 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-8 -mt-8 blur-2xl" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border", stat.bg, stat.color, stat.border)}>
              <stat.icon size={26} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-end">
               <span className="flex items-center gap-1 text-[10px] font-black text-brand-primary uppercase tracking-tighter bg-brand-primary/5 px-2 py-1 rounded-lg">
                 {stat.trend} <ArrowUpRight size={12} />
               </span>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none">{stat.value}</h3>
            <p className="text-[10px] font-bold text-slate-600 mt-2 italic">{stat.subtext}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

