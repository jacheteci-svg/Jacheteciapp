import { createClient } from '@/lib/supabase/server'
import PixelConfigForm from '@/components/admin/Pixel/PixelConfigForm'
import PixelLogs from '@/components/admin/Pixel/PixelLogs'
import MarketingCharts from '@/components/admin/Marketing/MarketingCharts'
import { Activity, ShieldCheck, BarChart3 } from 'lucide-react'

export default async function AdminPixelPage() {
  const supabase = await createClient()
  
  const { data: config } = await supabase
    .from('pixel_config')
    .select('*')
    .single()

  const { data: logs } = await supabase
    .from('pixel_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-white">Facebook Pixel & CAPI</h1>
        <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Optimisation marketing et conversion</p>
      </header>

      <MarketingCharts logs={logs || []} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1">
            <PixelConfigForm config={config} />
         </div>

         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity size={20} className="text-orange-500" />
                  Logs des événements (50 derniers)
               </h2>
               <div className="flex items-center gap-2 bg-green-500/10 text-green-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-green-500/20">
                  <ShieldCheck size={12} />
                  Signal Actif
               </div>
            </div>
            <PixelLogs logs={logs || []} />
         </div>
      </div>
    </div>
  )
}
