import { createClient } from '@/lib/supabase/server'
import StatsCards from '@/components/admin/Dashboard/StatsCards'
import RecentOrders from '@/components/admin/Dashboard/RecentOrders'
import AnalyticsCharts from '@/components/admin/Dashboard/AnalyticsCharts'
import { Plus, Package, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createClient()
  
  // Fetch data for the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const dateStr = sevenDaysAgo.toISOString()

  // 1. Visitors Data
  const { data: visitorsRaw } = await supabase
    .from('pixel_logs')
    .select('created_at')
    .gte('created_at', dateStr)

  // 2. Orders Data
  const { data: ordersRaw } = await supabase
    .from('commandes')
    .select('created_at, client_quartier')
    .gte('created_at', dateStr)

  // 3. Location Data (All time or last 30 days for better overview)
  const { data: locationsRaw } = await supabase
    .from('commandes')
    .select('client_quartier')

  // Process data for charts
  const processByDay = (raw: any[]) => {
    const days: any = {}
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      days[label] = 0
    }
    
    raw?.forEach(item => {
      const label = new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      if (days[label] !== undefined) days[label]++
    })

    return Object.entries(days).map(([date, count]) => ({ date, count }))
  }

  const processLocations = (raw: any[]) => {
    const counts: any = {}
    raw?.forEach(item => {
      const loc = item.client_quartier || 'Inconnu'
      counts[loc] = (counts[loc] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value as number) - (a.value as number))
      .slice(0, 5) // Top 5
  }

  const chartData = {
    visitors: processByDay(visitorsRaw || []),
    orders: processByDay(ordersRaw || []),
    locations: processLocations(locationsRaw || [])
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Dashboard</h1>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Vue d'ensemble de l'activité</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/produits/nouveau" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95">
            <Plus size={18} />
            Nouveau Produit
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <StatsCards />

      {/* Analytics Charts */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 px-2">
          <BarChart3 size={20} className="text-orange-500" />
          Analyses de Performance
        </h2>
        <AnalyticsCharts data={chartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package size={20} className="text-orange-500" />
              Dernières Commandes
            </h2>
            <Link href="/admin/commandes" className="text-orange-500 text-sm font-bold hover:underline">Voir tout</Link>
          </div>
          <RecentOrders />
        </div>

        {/* Status Breakdown / Alerts */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-white px-2">Alertes Stock</h2>
           <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-start gap-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <div className="bg-red-500/20 p-2 rounded-lg text-red-400">⚠️</div>
                <div>
                  <p className="font-bold text-red-200 text-sm leading-tight">Stock critique</p>
                  <p className="text-xs text-red-400/80 mt-1">Vérifiez les niveaux de produits bientôt en rupture.</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
