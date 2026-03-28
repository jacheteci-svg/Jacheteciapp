'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Layout, Star, Image as ImageIcon, Save, Upload, Loader2 } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import Modal from '@/components/ui/Modal'

export default function ContenuPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [bannieres, setBannieres] = useState<any[]>([])
  const [temoignages, setTemoignages] = useState<any[]>([])
  const [tab, setTab] = useState<'bannieres' | 'temoignages'>('bannieres')
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Modals state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)
  const [isTemoignageModalOpen, setIsTemoignageModalOpen] = useState(false)
  const [currentBanner, setCurrentBanner] = useState<any>(null)
  const [currentTemoignage, setCurrentTemoignage] = useState<any>(null)

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: { id: string, type: 'banniere' | 'temoignage' }) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(target.id)
    try {
      const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1920, useWebWorker: true, initialQuality: 0.8 }
      const compressedFile = await imageCompression(file, options)
      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${target.type}s/${fileName}`

      const { error } = await supabase.storage.from('site').upload(filePath, compressedFile)
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage.from('site').getPublicUrl(filePath)
      
      if (target.type === 'banniere') {
        setCurrentBanner({ ...currentBanner, image_url: publicUrl })
      } else {
        setCurrentTemoignage({ ...currentTemoignage, photo_url: publicUrl })
      }
    } catch (err: any) {
      alert("Erreur upload: " + err.message)
    } finally {
      setUploading(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const openAddBanner = () => {
    setCurrentBanner({ titre: '', sous_titre: '', image_url: '', actif: true, ordre: bannieres.length, position: 'haut' })
    setIsBannerModalOpen(true)
  }

  const openEditBanner = (b: any) => {
    setCurrentBanner({ ...b })
    setIsBannerModalOpen(true)
  }

  const handleSaveBanner = async () => {
    const { error } = await supabase.from('bannieres').upsert(currentBanner.id?.toString().startsWith('new_') ? { ...currentBanner, id: undefined } : currentBanner)
    if (!error) {
      setIsBannerModalOpen(false)
      fetchData()
    }
  }

  const deleteBanniere = async (id: any) => {
    if (confirm('Supprimer cette bannière ?')) {
      const { error } = await supabase.from('bannieres').delete().eq('id', id)
      if (!error) fetchData()
    }
  }

  const openAddTemoignage = () => {
    setCurrentTemoignage({ nom_client: '', commentaire: '', note: 5, photo_url: '', actif: true })
    setIsTemoignageModalOpen(true)
  }

  const openEditTemoignage = (t: any) => {
    setCurrentTemoignage({ ...t })
    setIsTemoignageModalOpen(true)
  }

  const handleSaveTemoignage = async () => {
    const { error } = await supabase.from('temoignages').upsert(currentTemoignage.id?.toString().startsWith('new_') ? { ...currentTemoignage, id: undefined } : currentTemoignage)
    if (!error) {
      setIsTemoignageModalOpen(false)
      fetchData()
    }
  }

  const deleteTemoignage = async (id: any) => {
    if (confirm('Supprimer ce témoignage ?')) {
      const { error } = await supabase.from('temoignages').delete().eq('id', id)
      if (!error) fetchData()
    }
  }

  if (loading) return <div className="p-8 text-white font-mono text-xs">Chargement...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
             <Layout className="text-blue-500" size={32} />
             Gérer le Contenu
          </h1>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Bannières et Témoignages Clients</p>
        </div>
        <div className="flex gap-2 bg-[#0f172a] p-1 rounded-2xl w-fit border border-slate-800 self-start md:self-center">
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
      </header>

      {tab === 'bannieres' ? (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">Bannières (@Accueil)</h3>
              <button onClick={openAddBanner} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg">
                 <Plus size={18} /> Ajouter une bannière
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bannieres.map((b) => (
                <div key={b.id} className="bg-[#1e293b] border border-slate-800 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all flex flex-col">
                   <div className="h-48 relative overflow-hidden bg-[#0f172a] flex items-center justify-center">
                      {b.image_url ? (
                        <img src={b.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <ImageIcon size={40} className="text-slate-800" />
                      )}
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                        {b.position || 'Haut'}
                      </div>
                      <div className={`absolute top-4 right-4 w-3 h-3 rounded-full border-2 border-[#1e293b] ${b.actif ? 'bg-green-500' : 'bg-red-500'}`} />
                   </div>
                   <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                         <h4 className="text-lg font-black text-white line-clamp-1">{b.titre || 'Sans titre'}</h4>
                         <p className="text-slate-400 text-xs font-medium line-clamp-1 mt-1">{b.sous_titre || 'Aucun sous-titre'}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                         <button onClick={() => openEditBanner(b)} className="text-blue-500 hover:bg-blue-500/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            Modifier
                         </button>
                         <button onClick={() => deleteBanniere(b.id)} className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all">
                            <Trash2 size={18} />
                         </button>
                      </div>
                   </div>
                </div>
              ))}
              {bannieres.length === 0 && (
                <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 font-black uppercase tracking-widest">
                   Aucune bannière configurée
                </div>
              )}
           </div>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">Témoignages Clients</h3>
              <button onClick={openAddTemoignage} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg">
                 <Plus size={18} /> Ajouter un témoignage
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {temoignages.map((t) => (
                <div key={t.id} className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-yellow-500/50 transition-all flex flex-col relative overflow-hidden">
                   {!t.actif && <div className="absolute inset-0 bg-slate-900/40 backdrop-grayscale z-10 pointer-events-none" />}
                   
                   <div className="flex items-center justify-between relative z-20">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-2xl bg-[#0f172a] border border-slate-700 flex items-center justify-center text-slate-500 overflow-hidden">
                            {t.photo_url ? <img src={t.photo_url} className="w-full h-full object-cover" /> : <Star size={20} />}
                         </div>
                         <div>
                            <h4 className="font-black text-white">{t.nom_client}</h4>
                            <div className="flex gap-0.5 text-yellow-500">
                               {[1,2,3,4,5].map(n => <Star key={n} size={10} fill={t.note >= n ? "currentColor" : "none"} />)}
                            </div>
                         </div>
                      </div>
                   </div>
                   
                   <p className="text-slate-400 text-xs font-medium italic line-clamp-3 flex-1 relative z-20">"{t.commentaire}"</p>
                   
                   <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 relative z-20">
                      <button onClick={() => openEditTemoignage(t)} className="text-yellow-500 hover:bg-yellow-500/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                         Modifier
                      </button>
                      <button onClick={() => deleteTemoignage(t.id)} className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all">
                         <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Upload Input Hook */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
        if (isBannerModalOpen) handleImageUpload(e, { id: currentBanner.id || 'new', type: 'banniere' })
        if (isTemoignageModalOpen) handleImageUpload(e, { id: currentTemoignage.id || 'new', type: 'temoignage' })
      }} />

      {/* Banner Modal */}
      <Modal isOpen={isBannerModalOpen} onClose={() => setIsBannerModalOpen(false)} title="Configurer la bannière">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="aspect-video bg-[#0f172a] rounded-3xl border border-slate-700 overflow-hidden relative group">
                  {currentBanner?.image_url ? (
                    <img src={currentBanner.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={48} className="text-slate-800" />
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="bg-white text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-all"
                     >
                        {uploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
                     </button>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Position</label>
                     <select 
                       className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-3 text-white font-black outline-none h-14"
                       value={currentBanner?.position || 'haut'}
                       onChange={e => setCurrentBanner({...currentBanner, position: e.target.value})}
                     >
                       <option value="haut">Accueil - Haut</option>
                       <option value="milieu">Accueil - Milieu</option>
                       <option value="bas">Accueil - Bas</option>
                       <option value="promo">Promotionnelle</option>
                     </select>
                  </div>
                  <label className="flex items-center gap-3 bg-[#0f172a] p-4 rounded-2xl border border-slate-700 cursor-pointer">
                     <input 
                       type="checkbox" 
                       checked={currentBanner?.actif} 
                       onChange={e => setCurrentBanner({...currentBanner, actif: e.target.checked})}
                       className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-600"
                     />
                     <span className="text-xs font-black text-white uppercase tracking-widest">Activer cette bannière</span>
                  </label>
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Titre de la bannière</label>
                  <input 
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-4 text-white font-black focus:border-blue-500 outline-none"
                    placeholder="Ex: Nouvelle Collection 2024"
                    value={currentBanner?.titre || ''}
                    onChange={e => setCurrentBanner({...currentBanner, titre: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sous-titre / Texte CTA</label>
                  <input 
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-4 text-white font-black focus:border-blue-500 outline-none"
                    placeholder="Ex: Jusqu'à -50% sur tout le site"
                    value={currentBanner?.sous_titre || ''}
                    onChange={e => setCurrentBanner({...currentBanner, sous_titre: e.target.value})}
                  />
               </div>
               <div className="space-y-2 pt-4">
                  <button onClick={handleSaveBanner} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                     <Save size={20} /> Enregistrer
                  </button>
               </div>
            </div>
         </div>
      </Modal>

      {/* Testimonial Modal */}
      <Modal isOpen={isTemoignageModalOpen} onClose={() => setIsTemoignageModalOpen(false)} title="Avis Client">
         <div className="space-y-8">
            <div className="flex items-center gap-6">
               <div className="w-24 h-24 rounded-3xl bg-[#0f172a] border border-slate-700 flex items-center justify-center text-slate-500 overflow-hidden relative group shrink-0">
                  {currentTemoignage?.photo_url ? (
                    <img src={currentTemoignage.photo_url} className="w-full h-full object-cover" />
                  ) : (
                    <Star size={32} />
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full text-black">
                        <Upload size={16} />
                     </button>
                  </div>
               </div>
               <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom du client</label>
                     <input 
                       className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-3 text-white font-black outline-none"
                       placeholder="Ex: Mariam Koné"
                       value={currentTemoignage?.nom_client || ''}
                       onChange={e => setCurrentTemoignage({...currentTemoignage, nom_client: e.target.value})}
                     />
                  </div>
                  <div className="flex items-center gap-4 justify-between bg-[#0f172a] p-4 rounded-2xl border border-slate-700">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Note globale</span>
                     <div className="flex gap-2 text-yellow-500">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} onClick={() => setCurrentTemoignage({...currentTemoignage, note: n})} className="transition-transform active:scale-125">
                             <Star size={20} fill={(currentTemoignage?.note || 0) >= n ? "currentColor" : "none"} />
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Témoignage (Commentaire)</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-4 text-white font-medium focus:border-yellow-500 outline-none resize-none"
                    placeholder="Ce que le client dit de sa commande..."
                    value={currentTemoignage?.commentaire || ''}
                    onChange={e => setCurrentTemoignage({...currentTemoignage, commentaire: e.target.value})}
                  />
               </div>
               
               <div className="flex items-center justify-between gap-6 pt-4">
                  <label className="flex-1 flex items-center gap-3 bg-[#0f172a] p-4 rounded-2xl border border-slate-700 cursor-pointer">
                     <input 
                       type="checkbox" 
                       checked={currentTemoignage?.actif} 
                       onChange={e => setCurrentTemoignage({...currentTemoignage, actif: e.target.checked})}
                       className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-yellow-500"
                     />
                     <span className="text-xs font-black text-white uppercase tracking-widest">Afficher publiquement</span>
                  </label>
                  <button onClick={handleSaveTemoignage} className="bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-yellow-500/20 active:scale-95 transition-all">
                     Confirmer
                  </button>
               </div>
            </div>
         </div>
      </Modal>
    </div>
  )
}
