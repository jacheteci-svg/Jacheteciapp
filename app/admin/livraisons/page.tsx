
'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Truck, Save, MapPin, Users, Phone, ShieldCheck } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function LivraisonsPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'zones' | 'livreurs'>('zones')
  const [loading, setLoading] = useState(true)
  
  // Zones State
  const [zones, setZones] = useState<any[]>([])
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false)
  const [currentZone, setCurrentZone] = useState<any>(null)

  // Livreurs State
  const [livreurs, setLivreurs] = useState<any[]>([])
  const [isLivreurModalOpen, setIsLivreurModalOpen] = useState(false)
  const [currentLivreur, setCurrentLivreur] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [zResp, lResp] = await Promise.all([
      supabase.from('zones_livraison').select('*').order('nom'),
      supabase.from('livreurs').select('*, zones_livraison(nom)').order('nom')
    ])
    
    if (zResp.data) setZones(zResp.data)
    if (lResp.data) setLivreurs(lResp.data)
    setLoading(false)
  }

  // --- ZONES LOGIC ---
  const handleSaveZone = async () => {
    const isNew = !currentZone.id || currentZone.id.toString().startsWith('new_')
    
    // Omit ID entirely for new records
    const { id, ...dataToSave } = currentZone

    const { error } = isNew 
      ? await supabase.from('zones_livraison').insert(dataToSave)
      : await supabase.from('zones_livraison').update(dataToSave).eq('id', id)
    
    if (!error) {
      setIsZoneModalOpen(false)
      fetchData()
    } else {
      alert("Erreur: " + error.message)
    }
  }

  const deleteZone = async (id: any) => {
    if (confirm('Supprimer cette zone ?')) {
      const { error } = await supabase.from('zones_livraison').delete().eq('id', id)
      if (!error) fetchData()
    }
  }

  // --- LIVREURS LOGIC ---
  const openAddLivreur = () => {
    setCurrentLivreur({ nom: '', telephone: '', zone_id: '', statut: 'disponible' })
    setIsLivreurModalOpen(true)
  }

  const handleSaveLivreur = async () => {
    const isNew = !currentLivreur.id
    const { id, zones_livraison, ...dataToSave } = currentLivreur

    const { error } = isNew
      ? await supabase.from('livreurs').insert(dataToSave)
      : await supabase.from('livreurs').update(dataToSave).eq('id', id)
    
    if (!error) {
      setIsLivreurModalOpen(false)
      fetchData()
    } else {
      alert("Erreur: " + error.message)
    }
  }

  const deleteLivreur = async (id: any) => {
    if (confirm('Supprimer ce livreur ?')) {
      const { error } = await supabase.from('livreurs').delete().eq('id', id)
      if (!error) fetchData()
    }
  }

  if (loading) return <div className="p-8 text-white font-mono text-xs">Chargement...</div>

  return (
    <div className="space-y-8 min-h-screen pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
             <Truck className="text-green-500" size={32} /> Logistique
          </h1>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Gérez vos zones et votre équipe de livraison</p>
        </div>
        
        <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700">
           <button 
             onClick={() => setActiveTab('zones')}
             className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'zones' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             Zones
           </button>
           <button 
             onClick={() => setActiveTab('livreurs')}
             className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'livreurs' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             Equipe
           </button>
        </div>
      </header>

      {activeTab === 'zones' ? (
        <section className="space-y-6">
           <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <MapPin size={20} className="text-green-500" /> Secteurs de livraison
              </h2>
              <button 
                onClick={() => { setCurrentZone({ nom: '', frais: 2000, delai_estime: '24h', actif: true }); setIsZoneModalOpen(true); }}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
              >
                <Plus size={18} /> Nouvelle Zone
              </button>
           </div>           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {zones.map(z => (
                <div key={z.id} className="glass bg-slate-900/40 border-white/5 rounded-[2rem] p-8 space-y-6 hover:border-green-500/20 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl" />
                   
                   <div className="flex items-center justify-between relative z-10">
                      <div>
                         <h3 className="text-xl font-black text-white tracking-tight">{z.nom}</h3>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">{z.delai_estime}</p>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => { setCurrentZone(z); setIsZoneModalOpen(true); }} className="p-3 glass hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white border-white/5"><Save size={18} /></button>
                         <button onClick={() => deleteZone(z.id)} className="p-3 glass hover:bg-red-500/5 rounded-xl transition-all text-red-500/50 hover:text-red-500 border-white/5"><Trash2 size={18} /></button>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-white tracking-tighter">{z.frais.toLocaleString()} <span className="text-[10px] text-slate-500 uppercase">FCFA</span></span>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${z.actif ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {z.actif ? 'Service Actif' : 'Désactivé'}
                      </span>
                   </div>
                </div>
              ))}
           </div>
        </section>
      ) : (
        <section className="space-y-6">
           <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <Users size={20} className="text-green-500" /> Livreurs & Partenaires
              </h2>
              <button 
                onClick={openAddLivreur}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
              >
                <Plus size={18} /> Ajouter un livreur
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {livreurs.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500 font-medium bg-slate-900/40 border border-dashed border-white/10 rounded-[2.5rem]">
                  Aucun livreur enregistré
                </div>
              )}
              {livreurs.map(l => (
                <div key={l.id} className="glass bg-slate-900/40 border-white/5 rounded-[2rem] p-8 space-y-6 hover:border-brand-primary/20 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl" />
                   
                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-5">
                         <div className="w-16 h-16 rounded-[1.2rem] bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-inner">
                            <Truck size={28} strokeWidth={2.5} />
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-white tracking-tight">{l.nom}</h3>
                            <p className="text-[10px] font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest mt-1">
                               <Phone size={12} className="text-brand-primary" /> {l.telephone}
                            </p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => { setCurrentLivreur(l); setIsLivreurModalOpen(true); }} className="p-3 glass hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white border-white/5"><Save size={18} /></button>
                         <button onClick={() => deleteLivreur(l.id)} className="p-3 glass hover:bg-red-500/5 rounded-xl transition-all text-red-500/50 hover:text-red-500 border-white/5"><Trash2 size={18} /></button>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-800/50 rounded-lg">
                            <MapPin size={14} className="text-slate-500" />
                         </div>
                         <span className="text-[11px] font-black text-slate-300 uppercase tracking-tighter">{l.zones_livraison?.nom || 'Toutes zones'}</span>
                      </div>
                      
                      <button 
                        onClick={async () => {
                           const newStatut = l.statut === 'disponible' ? 'occupé' : 'disponible'
                           const { error } = await supabase.from('livreurs').update({ statut: newStatut }).eq('id', l.id)
                           if (!error) fetchData()
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                          l.statut === 'disponible' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' 
                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20'
                        }`}
                      >
                        {l.statut}
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </section>
      )}

      {/* Zone Modal */}
      <Modal isOpen={isZoneModalOpen} onClose={() => setIsZoneModalOpen(false)} title={currentZone?.id ? "Modifier la zone" : "Nouvelle zone"}>
        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom de la zone</label>
              <input className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-3 text-white font-black focus:border-green-500 outline-none transition-all" value={currentZone?.nom || ''} onChange={e => setCurrentZone({...currentZone, nom: e.target.value})} />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Frais (FCFA)</label>
                 <input type="number" className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-3 text-white font-black focus:border-green-500 outline-none transition-all" value={currentZone?.frais || 0} onChange={e => setCurrentZone({...currentZone, frais: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Délai</label>
                 <input className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-3 text-white font-black focus:border-green-500 outline-none transition-all" value={currentZone?.delai_estime || ''} onChange={e => setCurrentZone({...currentZone, delai_estime: e.target.value})} />
              </div>
           </div>
           <button onClick={handleSaveZone} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2"><Save size={20} /> Enregistrer</button>
        </div>
      </Modal>

      {/* Livreur Modal */}
      <Modal isOpen={isLivreurModalOpen} onClose={() => setIsLivreurModalOpen(false)} title={currentLivreur?.id ? "Modifier le livreur" : "Nouveau livreur"}>
        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom du livreur</label>
              <input className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-3 text-white font-black focus:border-green-500 outline-none transition-all" value={currentLivreur?.nom || ''} onChange={e => setCurrentLivreur({...currentLivreur, nom: e.target.value})} />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Téléphone</label>
              <input className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-3 text-white font-black focus:border-green-500 outline-none transition-all" value={currentLivreur?.telephone || ''} onChange={e => setCurrentLivreur({...currentLivreur, telephone: e.target.value})} />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Zone assignée</label>
              <select className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-3 text-white font-black focus:border-green-500 outline-none transition-all appearance-none" value={currentLivreur?.zone_id || ''} onChange={e => setCurrentLivreur({...currentLivreur, zone_id: e.target.value || null})}>
                 <option value="">Toutes zones</option>
                 {zones.map(z => <option key={z.id} value={z.id}>{z.nom}</option>)}
              </select>
           </div>
           <button onClick={handleSaveLivreur} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2"><Save size={20} /> Enregistrer le profil</button>
        </div>
      </Modal>
    </div>
  )
}
