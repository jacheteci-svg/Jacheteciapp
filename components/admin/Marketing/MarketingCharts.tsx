'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { TrendingUp, ShoppingCart, DollarSign, Target } from 'lucide-react'
import { formatPrix } from '@/lib/utils/formatPrix'

export default function MarketingCharts({ logs }: { logs: any[] }) {
  // 1. Process Funnel Data
  const counts = {
    ViewContent: logs.filter(l => l.event_name === 'ViewContent').length,
    AddToCart: logs.filter(l => l.event_name === 'AddToCart').length,
    Purchase: logs.filter(l => l.event_name === 'Purchase').length,
  }

  const funnelData = [
    { name: 'Vues', value: counts.ViewContent, fill: '#64748b' },
    { name: 'Paniers', value: counts.AddToCart, fill: '#f97316' },
    { name: 'Achats', value: counts.Purchase, fill: '#22c55e' },
  ]

  // 2. Conversion Rates
  const convRateArr = counts.ViewContent > 0 
    ? ((counts.Purchase / counts.ViewContent) * 100).toFixed(1)
    : '0'
  
  const cartToPurchase = counts.AddToCart > 0
    ? ((counts.Purchase / counts.AddToCart) * 100).toFixed(1)
    : '0'

  // 3. Revenue
  const totalRevenue = logs
    .filter(l => l.event_name === 'Purchase' && l.statut === 'envoye')
    .reduce((acc, curr) => acc + (curr.montant || 0), 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
               <Target size={14} className="text-blue-500" /> Taux Conv. Global
            </div>
            <p className="text-3xl font-black text-white">{convRateArr}%</p>
         </div>
         <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
               <ShoppingCart size={14} className="text-orange-500" /> Panier &rarr; Achat
            </div>
            <p className="text-3xl font-black text-white">{cartToPurchase}%</p>
         </div>
         <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
               <DollarSign size={14} className="text-green-500" /> Chiffre d'Affaires
            </div>
            <p className="text-3xl font-black text-green-500">{formatPrix(totalRevenue)}</p>
         </div>
         <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
               <TrendingUp size={14} className="text-brand-primary" /> Total Events
            </div>
            <p className="text-3xl font-black text-white">{logs.length}</p>
         </div>
      </div>

      {/* Funnel Visual */}
      <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
         <h3 className="text-lg font-black text-white uppercase tracking-tighter">Entonnoir de Conversion Marketing</h3>
         
         <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={40}>
                   {funnelData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.fill} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
         </div>

         <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
            {funnelData.map((d, i) => (
               <div key={i} className="text-center">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{d.name}</p>
                  <p className="text-xl font-black text-white">{d.value}</p>
               </div>
            ))}
         </div>
      </div>
    </div>
  )
}
