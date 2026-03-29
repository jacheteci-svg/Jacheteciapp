import { createClient } from '@/lib/supabase/server'
import StatsCards from '@/components/admin/Dashboard/StatsCards'
import RecentOrders from '@/components/admin/Dashboard/RecentOrders'
import AnalyticsCharts from '@/components/admin/Dashboard/AnalyticsCharts'
import { Plus, Package, BarChart3, Bell, ArrowRight, ShieldAlert, Truck } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
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

  // 3. Location Data
  const { data: locationsRaw } = await supabase
    .from('commandes')
    .select('client_quartier')

  // Process data for charts
  const processByDay = (raw: any[]) => {
    const days: any = {}
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
      .slice(0, 5)
  }

  // 4. Detailed Stats for Cards
  const { data: allOrders } = await supabase
    .from('commandes')
    .select('montant_total, statut, created_at')

  const now = new Date()
  const todayStr = now.toLocaleDateString('fr-FR')
  
  const todayOrdersRaw = allOrders?.filter((o: any) => new Date(o.created_at).toLocaleDateString('fr-FR') === todayStr) || []
  const deliveredOrders = allOrders?.filter((o: any) => o.statut === 'livré') || []
  const attemptedOrders = allOrders?.filter((o: any) => ['livré', 'retour', 'annulé'].includes(o.statut)) || []
  
  const totalRevenue = deliveredOrders.reduce((sum: number, o: any) => sum + (o.montant_total || 0), 0)
  const successRate = attemptedOrders.length > 0 
    ? (deliveredOrders.length / attemptedOrders.length) * 100 
    : 100

  const statsData = {
    revenue: totalRevenue,
    todayOrders: todayOrdersRaw.length,
    successRate: Math.round(successRate),
    totalOrders: allOrders?.length || 0
  }

  const chartData = {
    visitors: processByDay(visitorsRaw || []),
    orders: processByDay(ordersRaw || []),
    locations: processLocations(locationsRaw || [])
  }

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-brand-primary font-black text-[10px] uppercase tracking-[0.3em] mb-2">
             <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" /> Live Overview
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">Dashboard</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.1em] text-xs">Performance & Hub Opérationnel</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/produits/nouveau" className="bg-white text-background px-8 py-4 rounded-[1.2rem] font-black text-sm flex items-center gap-3 transition-all shadow-xl shadow-white/5 hover:scale-105 active:scale-95">
            <Plus size={20} strokeWidth={3} />
            AJOUTER UN PRODUIT
          </Link>
        </div>
      </header>

      {/* Stats Cards Row */}
      <StatsCards data={statsData} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Column: Charts & Recent Orders */}
        <div className="lg:col-span-2 space-y-16">
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-white flex items-center gap-4 tracking-tight">
                <BarChart3 size={24} className="text-brand-primary" />
                Analyses de Performance
              </h2>
            </div>
            <AnalyticsCharts data={chartData} />
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-white flex items-center gap-4 tracking-tight">
                <Package size={24} className="text-accent-blue" />
                Activités Récentes
              </h2>
              <Link href="/admin/commandes" className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                Voir tout <ArrowRight size={14} />
              </Link>
            </div>
            <RecentOrders />
          </div>
        </div>

        {/* Right Column: Alerts & Status */}
        <aside className="space-y-10 lg:sticky lg:top-10">
           <div className="glass rounded-[2.5rem] p-8 border-white/5 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary/5 rounded-full blur-3xl" />
              <div className="flex items-center justify-between relative z-10">
                 <h3 className="text-xl font-black text-white tracking-tight">Poste de Contrôle</h3>
                 <Bell className="text-slate-600" size={20} />
              </div>
              
              <div className="space-y-4 relative z-10">
                 <div className="flex items-start gap-4 p-5 glass bg-brand-secondary/5 border-brand-secondary/10 rounded-[1.5rem] group hover:border-brand-secondary/30 transition-all cursor-pointer">
                    <div className="bg-brand-secondary/20 p-3 rounded-xl text-brand-secondary">
                       <ShieldAlert size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="font-black text-white text-sm uppercase tracking-tight">Stock Critique</p>
                      <p className="text-[11px] text-slate-500 font-bold mt-1 leading-relaxed">3 produits sont presque en rupture. Réapprovisionnement suggéré.</p>
                    </div>
                 </div>

                 <div className="flex items-start gap-4 p-5 glass bg-accent-blue/5 border-accent-blue/10 rounded-[1.5rem] group hover:border-accent-blue/30 transition-all cursor-pointer">
                    <div className="bg-accent-blue/20 p-3 rounded-xl text-accent-blue">
                       <Truck size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="font-black text-white text-sm uppercase tracking-tight">Logistique</p>
                      <p className="text-[11px] text-slate-500 font-bold mt-1 leading-relaxed">8 livraisons sont prévues pour aujourd'hui.</p>
                    </div>
                 </div>
              </div>

              <Link href="/admin/parametres" className="block w-full text-center py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em]">
                 Configuration Système
              </Link>
           </div>

           <div className="px-8 space-y-4">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Version Système</p>
              <div className="flex items-center gap-3">
                 <div className="px-3 py-1 glass rounded-full text-[10px] font-black text-brand-primary border-brand-primary/20">v4.0.2-PREMIUM</div>
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
           </div>
        </aside>
      </div>
    </div>
  )
}

