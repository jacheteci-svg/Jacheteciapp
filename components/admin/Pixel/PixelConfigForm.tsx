'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, AlertCircle } from 'lucide-react'

export default function PixelConfigForm({ config }: { config: any }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    pixel_id: config?.pixel_id || '',
    capi_token: config?.capi_token || '',
    actif: config?.actif ?? true,
    mode_test: config?.mode_test ?? false,
    test_event_code: config?.test_event_code || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase
      .from('pixel_config')
      .upsert({
        ...formData,
        updated_at: new Date().toISOString()
      })

    if (error) alert(error.message)
    else alert("Configuration enregistrée !")
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
       <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Pixel ID</label>
            <input 
              required
              className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-mono text-sm"
              placeholder="Ex: 123456789012345"
              value={formData.pixel_id}
              onChange={e => setFormData({...formData, pixel_id: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">CAPI Access Token</label>
            <textarea 
              required
              rows={4}
              className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-mono text-[10px] break-all"
              placeholder="EAAB..."
              value={formData.capi_token}
              onChange={e => setFormData({...formData, capi_token: e.target.value})}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded-2xl border border-slate-800">
             <div className="space-y-0.5">
                <span className="text-sm font-bold text-slate-300">Statut Global</span>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Tracking Actif</p>
             </div>
             <button 
                type="button"
                onClick={() => setFormData({...formData, actif: !formData.actif})}
                className={`w-12 h-6 rounded-full transition-all relative ${formData.actif ? 'bg-orange-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.actif ? 'left-7' : 'left-1'}`} />
              </button>
          </div>

          <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-400">
                   <AlertCircle size={16} />
                   <span className="text-xs font-bold uppercase tracking-widest">Mode Test CAPI</span>
                </div>
                <button 
                   type="button"
                   onClick={() => setFormData({...formData, mode_test: !formData.mode_test})}
                   className={`w-8 h-4 rounded-full transition-all relative ${formData.mode_test ? 'bg-orange-500' : 'bg-slate-700'}`}
                >
                   <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${formData.mode_test ? 'left-4.5' : 'left-0.5'}`} />
                </button>
             </div>
             {formData.mode_test && (
               <input 
                 className="w-full bg-[#0f172a] border border-orange-500/20 rounded-xl px-4 py-2 text-white text-xs font-mono"
                 placeholder="Code de test (ex: TEST1234)"
                 value={formData.test_event_code}
                 onChange={e => setFormData({...formData, test_event_code: e.target.value})}
               />
             )}
          </div>
       </div>

       <button 
          disabled={loading}
          className="w-full bg-white hover:bg-slate-100 text-[#0f172a] font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
       >
          <Save size={18} />
          {loading ? "Sauvegarde..." : "Enregistrer Config"}
       </button>
    </form>
  )
}
