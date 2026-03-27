'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/slugify'
import { Save, ImageIcon, X, Trash2, Plus } from 'lucide-react'

export default function ProductForm({ categories, initialData }: { categories: any[], initialData?: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
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

  // Basic image state (to be improved with actual upload)
  const [photos, setPhotos] = useState<string[]>(initialData?.produit_photos?.map((p: any) => p.url) || [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const slug = slugify(formData.nom)
    
    try {
      if (initialData) {
        // Update logic
      } else {
        const { data: produit, error } = await supabase
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

        // Handle photos...
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      <div className="lg:col-span-2 space-y-8">
        {/* Basic Info */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Informations de base</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Nom du produit *</label>
              <input 
                required
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-bold text-lg"
                placeholder="Ex: Montre de luxe"
                value={formData.nom}
                onChange={e => setFormData({...formData, nom: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Description *</label>
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

        {/* Media (Simplified for now) */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
           <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Photos (Max 5)</h2>
           <div className="grid grid-cols-5 gap-4">
              <div className="aspect-square bg-[#0f172a] border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 hover:border-orange-500 hover:text-orange-500 transition-all cursor-pointer">
                 <Plus size={24} />
                 <span className="text-[10px] font-black uppercase mt-2">Ajouter</span>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Pricing & Stock */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Prix & Stock</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Prix de vente (FCFA) *</label>
              <input 
                required
                type="number"
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-black text-xl text-orange-500"
                value={formData.prix}
                onChange={e => setFormData({...formData, prix: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Prix barré (Optionnel)</label>
              <input 
                type="number"
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-slate-400 line-through focus:border-orange-500 transition-all outline-none font-bold"
                value={formData.prix_barre}
                onChange={e => setFormData({...formData, prix_barre: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Quantité</label>
                  <input 
                    type="number"
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-mono"
                    value={formData.quantite}
                    onChange={e => setFormData({...formData, quantite: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Seuil Alerte</label>
                  <input 
                    type="number"
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-mono"
                    value={formData.seuil_alerte}
                    onChange={e => setFormData({...formData, seuil_alerte: e.target.value})}
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Category & Status */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 space-y-6">
           <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Catégorie *</label>
              <select 
                required
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none font-bold"
                value={formData.categorie_id}
                onChange={e => setFormData({...formData, categorie_id: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
           </div>

           <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded-2xl border border-slate-800">
              <span className="text-sm font-bold text-slate-400">Produit actif</span>
              <button 
                type="button"
                onClick={() => setFormData({...formData, actif: !formData.actif})}
                className={`w-12 h-6 rounded-full transition-all relative ${formData.actif ? 'bg-orange-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.actif ? 'left-7' : 'left-1'}`} />
              </button>
           </div>
        </div>

        {/* Global Action */}
        <button 
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all text-xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <Save size={24} />
          {loading ? "Enregistrement..." : "ENREGISTRER PRODUIT"}
        </button>
      </div>
    </form>
  )
}
