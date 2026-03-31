
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/slugify'
import { Save, ImageIcon, X, Loader2, Upload, Tag, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SimpleProductFormProps {
  categories: any[]
  initialData?: any
  onSuccess?: () => void
}

export default function SimpleProductForm({ categories, initialData, onSuccess }: SimpleProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    nom: initialData?.nom || '',
    description: initialData?.description || '',
    prix: initialData?.prix || '',
    prix_barre: initialData?.prix_barre || '',
    categorie_id: initialData?.categorie_id || '',
    quantite: initialData?.quantite || '0',
    actif: initialData?.actif ?? true
  })

  const [photos, setPhotos] = useState<any[]>(initialData?.produit_photos || [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        const filePath = `products/${fileName}`

        const { data, error } = await supabase.storage.from('produits').upload(filePath, file)
        if (error) throw error
        
        setPhotos(prev => [...prev, { url: data.url, est_principale: prev.length === 0, ordre: prev.length }])
      }
    } catch (err: any) {
      alert("Échec de l'envoi de l'image: " + err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nom || !formData.prix || !formData.categorie_id) {
      alert("Veuillez remplir les champs obligatoires (Nom, Prix, Catégorie)")
      return
    }

    setLoading(true)
    const slug = slugify(formData.nom)
    
    try {
      const payload = {
        nom: formData.nom.toUpperCase(),
        slug,
        description: formData.description,
        prix: Number(formData.prix),
        prix_barre: formData.prix_barre ? Number(formData.prix_barre) : null,
        categorie_id: formData.categorie_id,
        quantite: Number(formData.quantite),
        actif: formData.actif,
        updated_at: new Date().toISOString()
      }

      let productId = initialData?.id

      if (productId) {
        const { error } = await supabase.from('produits').update(productId, payload)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('produits').insert(payload)
        if (error) throw error
        // The insert shim returns data for first item if single, or full array
        productId = Array.isArray(data) ? data[0].id : data.id
      }

      // Sync photos
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

      alert("Produit enregistré avec succès !")
      if (onSuccess) onSuccess()
      else router.push('/admin/produits')
    } catch (err: any) {
      console.error(err)
      alert("Erreur lors de l'enregistrement: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Colonne Gauche: Infos */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Tag size={18} className="text-orange-500" /> Général
            </h3>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Nom du produit</label>
              <input 
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all placeholder:text-slate-700 font-bold"
                placeholder="EX: IPHONE 15 PRO"
                value={formData.nom}
                onChange={e => setFormData({...formData, nom: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Prix (FCFA)</label>
              <input 
                required
                type="number"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none font-bold"
                placeholder="50000"
                value={formData.prix}
                onChange={e => setFormData({...formData, prix: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Catégorie</label>
              <select 
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none appearance-none cursor-pointer"
                value={formData.categorie_id}
                onChange={e => setFormData({...formData, categorie_id: e.target.value})}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <LayoutGrid size={18} className="text-blue-500" /> Stock & Statut
            </h3>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Stock</label>
                <input 
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-center font-bold"
                  value={formData.quantite}
                  onChange={e => setFormData({...formData, quantite: e.target.value})}
                />
              </div>
              <div className="flex-1 flex items-center justify-center">
                 <button 
                  type="button"
                  onClick={() => setFormData({...formData, actif: !formData.actif})}
                  className={cn(
                    "px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border",
                    formData.actif ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                  )}
                 >
                  {formData.actif ? 'Produit Actif' : 'Produit Masqué'}
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Droite: Photos */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl space-y-4 h-full">
            <h3 className="text-white font-bold flex items-center gap-2">
              <ImageIcon size={18} className="text-purple-500" /> Photos
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {photos.map((p, i) => (
                <div key={i} className="aspect-square bg-black/40 border border-white/5 rounded-2xl overflow-hidden relative group">
                  <img src={p.url} className="w-full h-full object-cover" alt="" />
                  <button 
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  {i === 0 && <div className="absolute bottom-2 left-2 bg-orange-500 text-black text-[8px] font-black px-2 py-1 rounded-full uppercase">Principale</div>}
                </div>
              ))}
              
              {photos.length < 4 && (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square bg-black/20 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:border-orange-500/50 hover:text-orange-500 transition-all"
                >
                  {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                  <span className="text-[10px] mt-2 font-bold uppercase">Ajouter</span>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
                </button>
              )}
            </div>
            
            <p className="text-[9px] text-slate-500 italic mt-4 text-center">Formats: JPG, PNG • Max 4 photos</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Description</label>
        <textarea 
          className="w-full bg-slate-900/50 border border-white/10 rounded-3xl px-6 py-4 text-white focus:border-orange-500 outline-none min-h-[150px] resize-none"
          placeholder="Décrivez votre produit ici..."
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <button 
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
        {loading ? 'ENREGISTREMENT...' : 'PUBLIER LE PRODUIT'}
      </button>
    </form>
  )
}
