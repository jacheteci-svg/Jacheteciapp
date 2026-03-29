
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/slugify'
import { Save, ImageIcon, X, Trash2, Plus, Upload, Loader2, Zap, LayoutGrid, Info, Tag, Layers } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface ProductFormProps {
  categories: any[]
  initialData?: any
  onSuccess?: () => void
}

export default function ProductForm({ categories, initialData, onSuccess }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    nom: initialData?.nom || '',
    description: initialData?.description || '',
    prix: initialData?.prix || '',
    prix_barre: initialData?.prix_barre || '',
    categorie_id: initialData?.categorie_id || '',
    quantite: initialData?.quantite || '0',
    seuil_alerte: initialData?.seuil_alerte || '5',
    actif: initialData?.actif ?? true
  })

  const [photos, setPhotos] = useState<any[]>(initialData?.produit_photos || [])
  const [variants, setVariants] = useState<any[]>(initialData?.product_variants || [])
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    if (photos.length + files.length > 4) {
      alert("Maximum 4 images autorisées")
      return
    }

    setUploading(true)
    try {
      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        initialQuality: 0.8
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const compressedFile = await imageCompression(file, options)
        const fileExt = compressedFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `products/${fileName}`

        const { error } = await supabase.storage.from('produits').upload(filePath, compressedFile)
        if (error) throw error
        
        const { data: { publicUrl } } = supabase.storage.from('produits').getPublicUrl(filePath)
        setPhotos(prev => [...prev, { url: publicUrl, est_principale: prev.length === 0, ordre: prev.length }])
      }
    } catch (err: any) {
      alert("Erreur upload/compression: " + err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const addVariant = () => {
    setVariants([...variants, { name: '', value: '', price_override: null, stock_quantity: 0 }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const slug = slugify(formData.nom)
    
    try {
      let productId = initialData?.id
      
      const productPayload = {
        nom: formData.nom,
        slug,
        description: formData.description,
        prix: parseInt(formData.prix as string),
        prix_barre: formData.prix_barre ? parseInt(formData.prix_barre as string) : null,
        categorie_id: formData.categorie_id,
        quantite: parseInt(formData.quantite as string),
        seuil_alerte: parseInt(formData.seuil_alerte as string),
        actif: formData.actif,
      }

      if (productId) {
        const { error } = await supabase
          .from('produits')
          .update({ ...productPayload, updated_at: new Date().toISOString() })
          .eq('id', productId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('produits')
          .insert(productPayload)
          .select().single()
        if (error) throw error
        productId = data.id
      }

      await supabase.from('produit_photos').delete().eq('produit_id', productId)
      if (photos.length > 0) {
        const photosToSave = photos.map((p, i) => ({
          produit_id: productId,
          url: p.url,
          est_principale: i === 0,
          ordre: i
        }))
        await supabase.from('produit_photos').insert(photosToSave)
      }

      await supabase.from('product_variants').delete().eq('product_id', productId)
      if (variants.length > 0) {
        const variantsToSave = variants.filter(v => v.name && v.value).map(v => ({
          product_id: productId,
          name: v.name,
          value: v.value,
          price_override: v.price_override ? parseInt(v.price_override.toString()) : null,
          stock_quantity: parseInt(v.stock_quantity.toString())
        }))
        if (variantsToSave.length > 0) {
          await supabase.from('product_variants').insert(variantsToSave)
        }
      }

      if (onSuccess) onSuccess()
      else {
        router.push('/admin/produits')
        router.refresh()
      }
    } catch (err: any) {
      alert("Erreur: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-10 pb-20">
      <div className="lg:col-span-3 space-y-10">
        {/* Section: Basic Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[2.5rem] border-white/5 space-y-8"
        >
          <div className="flex items-center gap-4 text-white border-b border-white/5 pb-6">
             <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Info size={22} />
             </div>
             <div>
                <h3 className="text-xl font-black tracking-tight">Informations de base</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identité et description du produit</p>
             </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Nom du produit *</label>
              <input 
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-brand-primary transition-all outline-none font-black text-lg placeholder:text-slate-800"
                placeholder="EX: MONTRE DE LUXE"
                value={formData.nom}
                onChange={e => setFormData({...formData, nom: e.target.value.toUpperCase()})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Description détaillée</label>
              <textarea 
                required
                rows={8}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-brand-primary transition-all outline-none resize-none leading-relaxed text-sm placeholder:text-slate-800"
                placeholder="Brieve description du produit..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        </motion.div>

        {/* Section: Media */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-[2.5rem] border-white/5 space-y-8"
        >
           <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-4 text-white">
                 <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                    <ImageIcon size={22} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black tracking-tight">Galerie Media</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Maximum 4 photos • Optimisation auto</p>
                 </div>
              </div>
              {uploading && (
                <div className="flex items-center gap-2 text-brand-primary text-[10px] font-black animate-pulse bg-brand-primary/10 px-3 py-1.5 rounded-full">
                   <Loader2 className="animate-spin" size={14} /> LOADING...
                </div>
              )}
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {photos.map((p, i) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={p.url} 
                    className={cn(
                      "aspect-square bg-white/5 rounded-[1.5rem] overflow-hidden relative group border-2 transition-all shadow-xl shadow-black/20",
                      i === 0 ? 'border-brand-primary/50' : 'border-white/5 hover:border-white/20'
                    )}
                  >
                     <img src={p.url} className="w-full h-full object-cover" alt={`Photo ${i+1}`} />
                     
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                        {i !== 0 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const newPhotos = [...photos];
                              const [moved] = newPhotos.splice(i, 1);
                              newPhotos.unshift(moved);
                              setPhotos(newPhotos);
                            }}
                            className="bg-brand-primary text-black px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter"
                          >
                            Principal
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="bg-brand-secondary text-white p-2.5 rounded-full hover:scale-110 active:scale-95 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>

                     {i === 0 && (
                       <div className="absolute top-3 left-3 bg-brand-primary text-black text-[8px] font-black uppercase px-2 py-1 rounded-full shadow-lg">
                          Main
                       </div>
                     )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {photos.length < 4 && (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-[1.5rem] flex flex-col items-center justify-center text-slate-700 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all cursor-pointer group"
                >
                   <Upload size={32} className="group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-black uppercase mt-4 tracking-widest px-4 text-center">Ajouter Photo</span>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
                </button>
              )}
           </div>
        </motion.div>

        {/* Section: Variants */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-[2.5rem] border-white/5 space-y-8"
        >
           <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-4 text-white">
                 <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <Layers size={22} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black tracking-tight">Variantes</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tailles, Couleurs, Options spécifiques</p>
                 </div>
              </div>
              <button 
                type="button" 
                onClick={addVariant}
                className="bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase px-6 py-2 rounded-full border border-white/5 transition-all"
              >
                + Ajouter variante
              </button>
           </div>
           
           <div className="space-y-4">
              {variants.length === 0 && <p className="text-center py-10 text-slate-800 font-black uppercase text-[10px] tracking-widest">Aucune variante configurée</p>}
              {variants.map((v, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white/5 p-6 rounded-[1.8rem] border border-white/5 relative items-end group"
                >
                   <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-2 italic">Type</label>
                      <input 
                        className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-white text-xs font-bold focus:border-brand-primary outline-none"
                        placeholder="EX: COULEUR"
                        value={v.name}
                        onChange={e => { const n = [...variants]; n[i].name = e.target.value; setVariants(n) }}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-2 italic">Valeur</label>
                      <input 
                        className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-white text-xs font-bold focus:border-brand-primary outline-none"
                        placeholder="EX: ROUGE"
                        value={v.value}
                        onChange={e => { const n = [...variants]; n[i].value = e.target.value; setVariants(n) }}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-2 italic">Surcharge Prix</label>
                      <input 
                        type="number"
                        className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-white text-xs font-black focus:border-brand-primary outline-none font-mono"
                        placeholder="0"
                        value={v.price_override || ''}
                        onChange={e => { const n = [...variants]; n[i].price_override = e.target.value ? parseInt(e.target.value) : null; setVariants(n) }}
                      />
                   </div>
                   <div className="flex items-center gap-3">
                       <div className="flex-1 space-y-2">
                          <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-2 italic">Inventaire</label>
                          <input 
                            type="number"
                            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-white text-xs font-black focus:border-brand-primary outline-none font-mono"
                            value={v.stock_quantity}
                            onChange={e => { const n = [...variants]; n[i].stock_quantity = parseInt(e.target.value); setVariants(n) }}
                          />
                       </div>
                       <button onClick={() => removeVariant(i)} className="bg-brand-secondary/10 text-brand-secondary p-3 rounded-xl hover:bg-brand-secondary hover:text-white transition-all">
                          <Trash2 size={16} />
                       </button>
                   </div>
                </motion.div>
              ))}
           </div>
        </motion.div>
      </div>

      <div className="lg:col-span-2 space-y-10">
        {/* Pricing & Control */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-10 rounded-[2.5rem] border-white/5 space-y-10 lg:sticky lg:top-8"
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                 <Tag size={12} className="text-brand-primary" /> Prix Standard (FCFA)
              </label>
              <input 
                required
                type="number"
                className="w-full bg-brand-primary/5 border-2 border-brand-primary/10 rounded-[1.5rem] px-8 py-6 text-white focus:border-brand-primary transition-all outline-none font-black text-4xl text-center tabular-nums shadow-inner"
                value={formData.prix}
                onChange={e => setFormData({...formData, prix: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Prix barré / Promotion</label>
              <input 
                type="number"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-slate-600 line-through focus:border-brand-primary transition-all outline-none font-bold italic text-center text-xl placeholder:text-slate-800"
                placeholder="PROMO"
                value={formData.prix_barre}
                onChange={e => setFormData({...formData, prix_barre: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6 p-4 bg-white/5 rounded-[2rem] border border-white/5">
               <div className="space-y-3">
                  <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-center block">Stock Global</label>
                  <input 
                    type="number"
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white text-center font-black focus:border-brand-primary outline-none"
                    value={formData.quantite}
                    onChange={e => setFormData({...formData, quantite: e.target.value})}
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-center block">Seuil Alerte</label>
                  <input 
                    type="number"
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-brand-secondary text-center font-black focus:border-brand-primary outline-none"
                    value={formData.seuil_alerte}
                    onChange={e => setFormData({...formData, seuil_alerte: e.target.value})}
                  />
               </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                 <LayoutGrid size={12} className="text-accent-blue" /> Catégorie
              </label>
              <select 
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-brand-primary transition-all outline-none font-black uppercase text-xs tracking-widest appearance-none cursor-pointer"
                value={formData.categorie_id}
                onChange={e => setFormData({...formData, categorie_id: e.target.value})}
              >
                <option value="" className="bg-[#030712]">SÉLECTIONNER...</option>
                {categories.map((c: any) => <option key={c.id} value={c.id} className="bg-[#030712]">{c.name.toUpperCase()}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Statut du catalogue</span>
               <button 
                 type="button"
                 onClick={() => setFormData({...formData, actif: !formData.actif})}
                 className={cn(
                   "w-14 h-7 rounded-full transition-all relative",
                   formData.actif ? 'bg-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-slate-800'
                 )}
               >
                 <div className={cn(
                   "absolute top-1 w-5 h-5 rounded-full bg-black transition-all",
                   formData.actif ? 'left-8' : 'left-1'
                 )} />
               </button>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-white text-black font-black py-6 rounded-2xl shadow-xl shadow-white/5 active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? "Synchronisation..." : "VALIDER & PUBLIER"}
            </button>
          </div>
        </motion.div>
      </div>
    </form>
  )
}

