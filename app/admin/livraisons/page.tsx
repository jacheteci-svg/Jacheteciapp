
'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Truck, Save, MapPin } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function LivraisonsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [zones, setZones] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentZone, setCurrentZone] = useState<any>(null)

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

  const openAddModal = () => {
    setCurrentZone({ nom: '', frais: 2000, delai_estime: '24h - 48h', actif: true })
    setIsModalOpen(true)
  }

  const openEditModal = (zone: any) => {
    setCurrentZone({ ...zone })
    setIsModalOpen(true)
  }

  const handleSaveZone = async () => {
    const isNew = !currentZone.id || currentZone.id.toString().startsWith('new_')
    const toSave = isNew ? { ...currentZone, id: undefined } : currentZone
    
    const { error } = await supabase
      .from('zones_livraison')
      .upsert(toSave)
    
    if (!error) {
      setIsModalOpen(false)
      fetchZones()
    }
  }

  const deleteZone = async (id: any) => {
    if (confirm('Voulez-vous vraiment supprimer cette zone ?')) {
      const { error } = await supabase.from('zones_livraison').delete().eq('id', id)
      if (!error) fetchZones()
    }
  }

  const toggleZoneStatus = async (zone: any) => {
    const { error } = await supabase
      .from('zones_livraison')
      .update({ actif: !zone.actif })
      .eq('id', zone.id)
    if (!error) fetchZones()
  }

  const quickAddIvoirie = async () => {
    const ivoirieZones = [
      { nom: 'Abidjan - Cocody', frais: 1500, delai_estime: '24h', actif: true },
      { nom: 'Abidjan - Yopougon', frais: 2000, delai_estime: '24h', actif: true },
      { nom: 'Abidjan - Marcory', frais: 1500, delai_estime: '24h', actif: true },
      { nom: 'Abidjan - Plateau', frais: 1500, delai_estime: '24h', actif: true },
      { nom: 'Abidjan - Koumassi', frais: 2000, delai_estime: '24h', actif: true },
      { nom: 'Abidjan - Treichville', frais: 1500, delai_estime: '24h', actif: true },
      { nom: 'Abidjan - Abobo', frais: 2500, delai_estime: '24h', actif: true },
      { nom: 'Abidjan - Port-Bouët', frais: 2500, delai_estime: '24h', actif: true },
      { nom: 'Abidjan - Adjamé', frais: 1500, delai_estime: '24h', actif: true },
      { nom: 'Abidjan - Attécoubé', frais: 2000, delai_estime: '24h', actif: true },
      { nom: 'Bingerville', frais: 2500, delai_estime: '24h - 48h', actif: true },
      { nom: 'Grand-Bassam', frais: 3000, delai_estime: '24h - 48h', actif: true },
      { nom: 'Anyama', frais: 3000, delai_estime: '48h', actif: true },
      { nom: 'Songon', frais: 3500, delai_estime: '48h', actif: true },
      { nom: 'Intérieur (Bouaké, SP, Yam)', frais: 5000, delai_estime: '48h - 72h', actif: true },
    ]
    const { error } = await supabase.from('zones_livraison').insert(ivoirieZones)
    if (!error) fetchZones()
  }

  if (loading) return <div className="p-8 text-white font-mono text-xs">Chargement...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
             <Truck className="text-green-500" size={32} />
             Zones de Livraison
          </h1>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Gérez vos tarifs et délais par zone</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <button onClick={quickAddIvoirie} className="bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 border border-brand-primary/20">
              <Plus size={20} /> Pack Zones Côte d'Ivoire
           </button>
           <button onClick={openAddModal} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95">
              <Plus size={20} /> Zone Perso
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {zones.map((z) => (
           <div key={z.id} className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-green-500/50 transition-colors group relative overflow-hidden">
              {!z.actif && <div className="absolute inset-0 bg-slate-900/40 backdrop-grayscale z-10 pointer-events-none" />}
              
              <div className="flex items-center justify-between relative z-20">
                 <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${z.actif ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-500'}`}>
                       <MapPin size={20} />
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-white">{z.nom}</h3>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{z.delai_estime}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(z)} className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition-all">
                       <Save size={18} />
                    </button>
                    <button onClick={() => deleteZone(z.id)} className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all">
                       <Trash2 size={18} />
                    </button>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 relative z-20">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tarif Livraison</span>
                    <span className="text-xl font-black text-white">{z.frais.toLocaleString()} <span className="text-[10px] text-slate-500">FCFA</span></span>
                 </div>
                 <button 
                   onClick={() => toggleZoneStatus(z)}
                   className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${z.actif ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                 >
                   {z.actif ? 'Active' : 'Désactivée'}
                 </button>
              </div>
           </div>
         ))}
      </div>

      {/* Zone Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentZone?.id ? "Modifier la zone" : "Nouvelle zone"}
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom de la zone</label>
              <input 
                className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-3 text-white font-black focus:border-green-500 outline-none transition-all"
                placeholder="Ex: Abidjan - Cocody"
                value={currentZone?.nom || ''}
                onChange={e => setCurrentZone({...currentZone, nom: e.target.value})}
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Frais (FCFA)</label>
                 <input 
                   type="number"
                   className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-3 text-white font-black focus:border-green-500 outline-none transition-all"
                   value={currentZone?.frais || ''}
                   onChange={e => setCurrentZone({...currentZone, frais: parseInt(e.target.value)})}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Délai</label>
                 <input 
                   className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-3 text-white font-black focus:border-green-500 outline-none transition-all"
                   placeholder="Ex: 24h"
                   value={currentZone?.delai_estime || ''}
                   onChange={e => setCurrentZone({...currentZone, delai_estime: e.target.value})}
                 />
              </div>
           </div>

           <button 
             onClick={handleSaveZone}
             className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
           >
             <Save size={20} /> Confirmer la zone
           </button>
        </div>
      </Modal>
    </div>
  )
}
