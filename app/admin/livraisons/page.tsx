
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Truck, Save, MapPin, ToggleLeft as Toggle } from 'lucide-react'

export default function LivraisonsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [zones, setZones] = useState<any[]>([])

  useEffect(() => {
    fetchZones()
  }, [])

  const fetchZones = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('zones_livraison')
      .select('*')
      .order('nom', { ascending: true })
    
    if (data) setZones(data)
    setLoading(false)
  }

  const addZone = () => {
    const newZone = { id: `new_${Date.now()}`, nom: '', frais: 2000, delai_estime: '24h - 48h', actif: true }
    setZones([...zones, newZone])
  }

  const saveZones = async () => {
    const toSave = zones.map(({id, ...rest}) => id.toString().startsWith('new_') ? rest : {id, ...rest})
    const { error } = await supabase.from('zones_livraison').upsert(toSave)
    if (!error) {
      alert('Zones de livraison sauvegardées !')
      fetchZones()
    }
  }

  const deleteZone = async (id: any) => {
    if (id.toString().startsWith('new_')) {
      setZones(zones.filter(z => z.id !== id))
      return
    }
    const { error } = await supabase.from('zones_livraison').delete().eq('id', id)
    if (!error) fetchZones()
  }

  if (loading) return <div className="p-8 text-white font-mono text-xs">Chargement...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
             <Truck className="text-green-500" size={32} />
             Zones de Livraison
          </h1>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Gérez vos tarifs et délais par zone</p>
        </div>
        <div className="flex gap-4">
           <button onClick={addZone} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95">
              <Plus size={20} /> Ajouter une zone
           </button>
           <button onClick={saveZones} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-green-600/20 active:scale-95">
              <Save size={20} /> Sauvegarder
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {zones.map((z, i) => (
           <div key={z.id} className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-green-500/50 transition-colors group">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-white">
                    <MapPin className="text-slate-500 group-hover:text-green-500 transition-colors" size={18} />
                    <input 
                      className="bg-transparent border-none focus:ring-0 text-lg font-black placeholder:text-slate-700 w-full"
                      value={z.nom}
                      placeholder="Nom de la zone..."
                      onChange={e => {
                        const n = [...zones]; n[i].nom = e.target.value; setZones(n)
                      }}
                    />
                 </div>
                 <button onClick={() => deleteZone(z.id)} className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all">
                    <Trash2 size={18} />
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Frais (FCFA)</label>
                    <input 
                      type="number"
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2 text-white font-black text-sm focus:border-green-500 outline-none"
                      value={z.frais}
                      onChange={e => {
                        const n = [...zones]; n[i].frais = parseInt(e.target.value); setZones(n)
                      }}
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Délai Estimé</label>
                    <input 
                       className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2 text-white font-bold text-sm focus:border-green-500 outline-none"
                       value={z.delai_estime}
                       onChange={e => {
                         const n = [...zones]; n[i].delai_estime = e.target.value; setZones(n)
                       }}
                    />
                 </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Disponibilité</span>
                 <button 
                   onClick={() => {
                     const n = [...zones]; n[i].actif = !n[i].actif; setZones(n)
                   }}
                   className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${z.actif ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                 >
                   {z.actif ? 'Active' : 'Désactivée'}
                 </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  )
}
