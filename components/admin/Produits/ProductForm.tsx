
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/slugify'
import { Save, ImageIcon, X, Trash2, Plus, Upload, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface ProductFormProps {
  categories: any[]
  initialData?: any
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
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
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `products/${fileName}`

        const { data, error } = await supabase.storage
          .from('produits')
          .upload(filePath, file)

        if (error) throw error
        
        const { data: { publicUrl } } = supabase.storage.from('produits').getPublicUrl(filePath)
        
        setPhotos(prev => [...prev, { url: publicUrl, est_principale: prev.length === 0, ordre: prev.length }])
      }
    } catch (err: any) {
      alert("Erreur upload: " + err.message)
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
      
      // 1. Save Product
      if (productId) {
        const { error } = await supabase
          .from('produits')
          .update({
            nom: formData.nom,
            slug,
            description: formData.description,
            prix: parseInt(formData.prix as string),
            prix_barre: formData.prix_barre ? parseInt(formData.prix_barre as string) : null,
            categorie_id: formData.categorie_id,
            quantite: parseInt(formData.quantite as string),
            seuil_alerte: parseInt(formData.seuil_alerte as string),
            actif: formData.actif,
            updated_at: new Date().toISOString()
          })
          .eq('id', productId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('produits')
          .insert({
            nom: formData.nom,
            slug,
            description: formData.description,
            prix: parseInt(formData.prix as string),
            prix_barre: formData.prix_barre ? parseInt(formData.prix_barre as string) : null,
            categorie_id: formData.categorie_id,
            quantite: parseInt(formData.quantite as string),
            seuil_alerte: parseInt(formData.seuil_alerte as string),
            actif: formData.actif
          })
          .select()
          .single()
        if (error) throw error
        productId = data.id
      }

      // 2. Handle Photos
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

      // 3. Handle Variants
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

      router.push('/admin/produits')
      router.refresh()
    } catch (err: any) {
      alert("Erreur: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-8">
        {/* Basic Info */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
             <Save size={20} className="text-orange-500" /> Informations de base
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nom du produit *</label>
              <input 
                required
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-bold text-lg"
                placeholder="Ex: Montre de luxe"
                value={formData.nom}
                onChange={e => setFormData({...formData, nom: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Description *</label>
              <textarea 
                required
                rows={6}
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none resize-none leading-relaxed"
                placeholder="Décrivez votre produit en détail..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
           <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2"><ImageIcon size={20} className="text-blue-500" /> Photos (Max 4)</div>
              {uploading && <Loader2 className="animate-spin text-blue-500" size={20} />}
           </h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((p, i) => (
                <div key={i} className="aspect-square bg-[#0f172a] rounded-2xl overflow-hidden relative group border border-slate-800">
                   <img src={p.url} className="w-full h-full object-cover" />
                   <button 
                     type="button"
                     onClick={() => removePhoto(i)}
                     className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                   >
                     <X size={14} />
                   </button>
                   {i === 0 && <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-md">Principale</span>}
                </div>
              ))}
              {photos.length < 4 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-[#0f172a] border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 hover:border-orange-500 hover:text-orange-500 transition-all cursor-pointer group"
                >
                   <Upload size={24} className="group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-black uppercase mt-2">Ajouter</span>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileChange} 
                     multiple 
                     accept="image/*" 
                     className="hidden" 
                   />
                </div>
              )}
           </div>
        </div>

        {/* Variants */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
           <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2"><Plus size={20} className="text-green-500" /> Variantes (Prix/Couleur)</div>
              <button 
                type="button" 
                onClick={addVariant}
                className="bg-green-500/10 text-green-500 hover:bg-green-500 text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all hover:text-white"
              >
                + Ajouter variante
              </button>
           </h2>
           
           <div className="space-y-4">
              {variants.length === 0 && <p className="text-center py-8 text-slate-500 font-medium italic text-sm">Aucune variante définie</p>}
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800 relative group animate-in slide-in-from-right-4 duration-300">
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Type (ex: Couleur)</label>
                      <input 
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-green-500 outline-none"
                        value={v.name}
                        onChange={e => {
                           const n = [...variants]; n[i].name = e.target.value; setVariants(n)
                        }}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Valeur (ex: Rouge)</label>
                      <input 
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-green-500 outline-none"
                        value={v.value}
                        onChange={e => {
                           const n = [...variants]; n[i].value = e.target.value; setVariants(n)
                        }}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Prix (Overide)</label>
                      <input 
                        type="number"
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-green-500 outline-none"
                        value={v.price_override || ''}
                        onChange={e => {
                           const n = [...variants]; n[i].price_override = e.target.value ? parseInt(e.target.value) : null; setVariants(n)
                        }}
                      />
                   </div>
                   <div className="flex items-end gap-2">
                       <div className="flex-1 space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Stock</label>
                          <input 
                            type="number"
                            className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-green-500 outline-none"
                            value={v.stock_quantity}
                            onChange={e => {
                               const n = [...variants]; n[i].stock_quantity = parseInt(e.target.value); setVariants(n)
                            }}
                          />
                       </div>
                       <button onClick={() => removeVariant(i)} className="bg-red-500/10 text-red-500 p-2.5 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={16} />
                       </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Pricing & Stock */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6 sticky top-8">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Prix & Stock Global</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Prix de vente (FCFA) *</label>
              <input 
                required
                type="number"
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-black text-2xl text-orange-500"
                value={formData.prix}
                onChange={e => setFormData({...formData, prix: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Prix barré (Optionnel)</label>
              <input 
                type="number"
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-slate-500 line-through focus:border-orange-500 transition-all outline-none font-bold italic"
                value={formData.prix_barre}
                onChange={e => setFormData({...formData, prix_barre: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Quantité Totale</label>
                  <input 
                    type="number"
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-mono"
                    value={formData.quantite}
                    onChange={e => setFormData({...formData, quantite: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Seuil Alerte</label>
                  <input 
                    type="number"
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-mono"
                    value={formData.seuil_alerte}
                    onChange={e => setFormData({...formData, seuil_alerte: e.target.value})}
                  />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Catégorie *</label>
              <select 
                required
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-bold"
                value={formData.categorie_id}
                onChange={e => setFormData({...formData, categorie_id: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                {(categories || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded-2xl border border-slate-800">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Produit actif</span>
               <button 
                 type="button"
                 onClick={() => setFormData({...formData, actif: !formData.actif})}
                 className={`w-12 h-6 rounded-full transition-all relative ${formData.actif ? 'bg-orange-500' : 'bg-slate-700'}`}
               >
                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.actif ? 'left-7' : 'left-1'}`} />
               </button>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all text-xl flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
              {loading ? "ENREGISTREMENT..." : "SAUVEGARDER"}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
