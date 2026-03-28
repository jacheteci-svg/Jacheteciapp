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

interface ChartData {
  visitors: any[]
  orders: any[]
  locations: any[]
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#a855f7']

export default function AnalyticsCharts({ data }: { data: ChartData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Visitors Chart */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white px-2">Visiteurs (7 derniers jours)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.visitors}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                itemStyle={{ color: '#f97316' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#f97316" 
                fillOpacity={1} 
                fill="url(#colorVisitors)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white px-2">Commandes (7 derniers jours)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.orders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#334155', opacity: 0.1 }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Locations Chart */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 space-y-4 md:col-span-2">
        <h3 className="text-lg font-bold text-white px-2">Provenance des Commandes (Zones)</h3>
        <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.locations}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.locations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
              />
              <Legend verticalAlign="middle" align="right" layout="vertical" formatter={(value) => <span className="text-slate-400 font-medium">{value}</span>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
