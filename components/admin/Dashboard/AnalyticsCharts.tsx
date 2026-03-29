'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { motion } from 'framer-motion'

interface ChartData {
  visitors: any[]
  orders: any[]
  locations: any[]
}

const COLORS = ['#2dd4bf', '#3b82f6', '#f97316', '#a855f7', '#ec4899']

export default function AnalyticsCharts({ data }: { data: ChartData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Visitors Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="glass border-white/5 rounded-[2.5rem] p-8 space-y-6"
      >
        <div className="flex items-center justify-between px-2">
           <h3 className="text-lg font-black text-white tracking-tight">Visiteurs</h3>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">7 derniers jours</span>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.visitors}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                itemStyle={{ color: '#2dd4bf', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#2dd4bf" 
                fillOpacity={1} 
                fill="url(#colorVisitors)" 
                strokeWidth={4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Orders Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="glass border-white/5 rounded-[2.5rem] p-8 space-y-6"
      >
        <div className="flex items-center justify-between px-2">
           <h3 className="text-lg font-black text-white tracking-tight">Commandes</h3>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Performance hebdomadaire</span>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.orders}>
               <defs>
                 <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                   <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4}/>
                 </linearGradient>
               </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
              />
              <Bar dataKey="count" fill="url(#barGradient)" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>


      {/* Locations Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="glass border-white/5 rounded-[2.5rem] p-8 space-y-6 md:col-span-2"
      >
        <div className="flex items-center justify-between px-2">
           <h3 className="text-lg font-black text-white tracking-tight">Répartition Géographique</h3>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Zones de Livraison</span>
        </div>
        <div className="h-[350px] w-full flex flex-col md:flex-row items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.locations}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {data.locations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
              />
              <Legend 
                verticalAlign="middle" 
                align="right" 
                layout="vertical" 
                formatter={(value) => <span className="text-slate-400 font-bold text-sm ml-2 uppercase tracking-tight">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}

