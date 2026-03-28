
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Settings, Phone, Image as ImageIcon, MessageSquare, Globe, Upload, Loader2, Shield } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { useRef } from 'react'

export default function ParametresPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [params, setParams] = useState<any>({
    nom_boutique: 'JACHETE.CI',
    logo_url: '',
    whatsapp_principal: '',
    whatsapp_backup: '',
    message_bienvenue_wa: '',
    horaires_livraison: '',
    pixel_id: '',
    google_analytics_id: ''
  })

  useEffect(() => {
    fetchParams()
  }, [])

  const fetchParams = async () => {
    try {
      const { data, error } = await supabase
        .from('parametres')
        .select('*')
        .single()
      
      if (data) setParams(data)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 500,
        useWebWorker: true
      }
      
      const compressedFile = await imageCompression(file, options)
      const fileName = `logo-${Date.now()}.png`
      const filePath = `identity/${fileName}`

      const { data, error } = await supabase.storage
        .from('site')
        .upload(filePath, compressedFile)

      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage.from('site').getPublicUrl(filePath)
      setParams({ ...params, logo_url: publicUrl })
    } catch (err: any) {
      alert("Erreur upload logo: " + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('parametres')
        .upsert(params)
      
      if (error) alert('Erreur lors de la sauvegarde : ' + error.message)
      else alert('Paramètres sauvegardés avec succès !')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-white font-mono text-xs">Chargement...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
             <Settings className="text-orange-500" size={32} />
             Paramètres
          </h1>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Configuration générale de votre boutique</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Identité */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
           <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Globe size={20} className="text-blue-400" /> Identité & SEO
           </h3>
           <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nom de la boutique</label>
                <input 
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-orange-500 outline-none transition-all"
                  value={params.nom_boutique}
                  onChange={e => setParams({...params, nom_boutique: e.target.value})}
                />
              </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-6">
                     <div className="w-24 h-24 bg-[#0f172a] border border-slate-700 rounded-3xl flex items-center justify-center overflow-hidden relative group shrink-0">
                        {params.logo_url ? <img src={params.logo_url} className="w-full h-full object-contain" /> : <ImageIcon size={32} className="text-slate-700" />}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="text-white p-2"
                           >
                              {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                           </button>
                        </div>
                     </div>
                     <div className="flex-1 space-y-1">
                        <p className="text-xs font-black text-white uppercase tracking-widest">Logo de la boutique</p>
                        <p className="text-[10px] text-slate-500 font-medium">Recommandé : PNG transparent, 512x512px</p>
                        <input 
                           type="file" 
                           ref={fileInputRef} 
                           className="hidden" 
                           accept="image/*"
                           onChange={handleLogoUpload}
                        />
                     </div>
                  </div>
               </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Facebook Pixel ID</label>
                    <input 
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-orange-500 outline-none transition-all"
                      value={params.pixel_id}
                      onChange={e => setParams({...params, pixel_id: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">GA4 ID</label>
                    <input 
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-orange-500 outline-none transition-all"
                      value={params.google_analytics_id}
                      onChange={e => setParams({...params, google_analytics_id: e.target.value})}
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Contact & WhatsApp */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
           <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Phone size={20} className="text-green-400" /> Contacts & WhatsApp
           </h3>
           <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">WhatsApp Principal</label>
                    <input 
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-orange-500 outline-none transition-all"
                      value={params.whatsapp_principal}
                      onChange={e => setParams({...params, whatsapp_principal: e.target.value})}
                    />
                 </div>
                  <div className="space-y-2">
                     <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WhatsApp Backup</label>
                        <span className="text-[8px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1">
                           <Shield size={10} /> Secours
                        </span>
                     </div>
                     <input 
                       className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-orange-500 outline-none transition-all"
                       placeholder="Numéro de secours (ex: 01...)"
                       value={params.whatsapp_backup}
                       onChange={e => setParams({...params, whatsapp_backup: e.target.value})}
                     />
                  </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Message de Bienvenue WhatsApp</label>
                <textarea 
                  rows={4}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white font-medium focus:border-orange-500 outline-none transition-all resize-none"
                  value={params.message_bienvenue_wa}
                  onChange={e => setParams({...params, message_bienvenue_wa: e.target.value})}
                />
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
