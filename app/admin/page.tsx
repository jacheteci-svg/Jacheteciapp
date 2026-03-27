import { createClient } from '@/lib/supabase/server'
import StatsCards from '@/components/admin/Dashboard/StatsCards'
import RecentOrders from '@/components/admin/Dashboard/RecentOrders'
import { Plus, Package } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createClient()
  
  // Dashboard is server-side fetched
  const { count: totalCommandes } = await supabase.from('commandes').select('*', { count: 'exact', head: true })
  const { data: statsData } = await supabase.rpc('get_admin_stats') // RPC if needed, or manual fetch

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white">Dashboard</h1>
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
              {/* This would be a dynamic list of low stock items */}
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
