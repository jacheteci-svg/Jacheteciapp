
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Layout, Star, Image as ImageIcon, Save, CheckCircle, XCircle } from 'lucide-react'

export default function ContenuPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [bannieres, setBannieres] = useState<any[]>([])
  const [temoignages, setTemoignages] = useState<any[]>([])
  const [tab, setTab] = useState<'bannieres' | 'temoignages'>('bannieres')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [bRes, tRes] = await Promise.all([
      supabase.from('bannieres').select('*').order('ordre', { ascending: true }),
      supabase.from('temoignages').select('*').order('created_at', { ascending: false })
    ])
    if (bRes.data) setBannieres(bRes.data)
    if (tRes.data) setTemoignages(tRes.data)
    setLoading(false)
  }

  const addBanniere = () => {
    const newB = { id: `new_${Date.now()}`, image_url: '', titre: '', sous_titre: '', actif: true, ordre: bannieres.length }
    setBannieres([...bannieres, newB])
  }

  const saveBannieres = async () => {
    const toSave = bannieres.map(({id, ...rest}) => id.toString().startsWith('new_') ? rest : {id, ...rest})
    const { error } = await supabase.from('bannieres').upsert(toSave)
    if (!error) {
      alert('Bannières sauvegardées !')
      fetchData()
    }
  }

  const deleteBanniere = async (id: any) => {
    if (id.toString().startsWith('new_')) {
      setBannieres(bannieres.filter(b => b.id !== id))
      return
    }
    const { error } = await supabase.from('bannieres').delete().eq('id', id)
    if (!error) fetchData()
  }

  if (loading) return <div className="p-8 text-white font-mono text-xs">Chargement...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
             <Layout className="text-blue-500" size={32} />
             Gérer le Contenu
          </h1>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Bannières, Témoignages et Éléments de réassurance</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#0f172a] p-1 rounded-2xl w-fit border border-slate-800">
         <button 
           onClick={() => setTab('bannieres')}
           className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'bannieres' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
         >
           Bannières
         </button>
         <button 
           onClick={() => setTab('temoignages')}
           className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'temoignages' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
         >
           Témoignages
         </button>
      </div>

      {tab === 'bannieres' ? (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">Bannières d'accueil</h3>
              <div className="flex gap-4">
                 <button onClick={addBanniere} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
                    <Plus size={16} /> Ajouter
                 </button>
                 <button onClick={saveBannieres} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-600/20">
                    <Save size={16} /> Sauvegarder tout
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-6">
              {bannieres.map((b, i) => (
                <div key={b.id} className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row gap-6">
                   <div className="w-full md:w-64 h-32 bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center relative group">
                      {b.image_url ? (
                        <img src={b.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-slate-700" size={32} />
                      )}
                   </div>
                   <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Image URL</label>
                        <input 
                           className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2 text-white font-bold text-xs focus:border-blue-500 outline-none"
                           value={b.image_url}
                           onChange={e => {
                             const n = [...bannieres]; n[i].image_url = e.target.value; setBannieres(n)
                           }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Titre</label>
                        <input 
                           className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2 text-white font-bold text-xs focus:border-blue-500 outline-none"
                           value={b.titre}
                           onChange={e => {
                             const n = [...bannieres]; n[i].titre = e.target.value; setBannieres(n)
                           }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Sous-titre</label>
                        <input 
                           className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2 text-white font-bold text-xs focus:border-blue-500 outline-none"
                           value={b.sous_titre}
                           onChange={e => {
                             const n = [...bannieres]; n[i].sous_titre = e.target.value; setBannieres(n)
                           }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4 mt-6">
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={b.actif} 
                              onChange={e => {
                                const n = [...bannieres]; n[i].actif = e.target.checked; setBannieres(n)
                              }}
                              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-black text-white uppercase tracking-widest">Actif</span>
                         </label>
                         <button onClick={() => deleteBanniere(b.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all">
                            <Trash2 size={18} />
                         </button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="text-white font-mono text-sm opacity-50 p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">
           Gestion des témoignages en cours de déploiement...
        </div>
      )}
    </div>
  )
}
