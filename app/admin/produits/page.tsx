'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProductList from '@/components/admin/Produits/ProductList'
import { Plus, Search, Package, Save, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function AdminProduitsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [produits, setProduits] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newProduct, setNewProduct] = useState({
    nom: '',
    prix: 0,
    quantite: 0,
    category_id: '',
    description: '',
    actif: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [pRes, cRes] = await Promise.all([
      supabase.from('produits').select('*, categories(name), produit_photos(url)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name', { ascending: true })
    ])
    if (pRes.data) setProduits(pRes.data)
    if (cRes.data) {
      setCategories(cRes.data)
      if (cRes.data.length > 0) setNewProduct(prev => ({ ...prev, category_id: cRes.data[0].id }))
    }
    setLoading(false)
  }

  const handleQuickAdd = async () => {
    if (!newProduct.nom || !newProduct.prix) {
      alert('Veuillez remplir au moins le nom et le prix.')
      return
    }

    setIsSaving(true)
    const slug = newProduct.nom.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 5)
    
    const { data, error } = await supabase
      .from('produits')
      .insert([{ ...newProduct, slug }])
      .select()

    if (!error) {
      setIsModalOpen(false)
      setNewProduct({ nom: '', prix: 0, quantite: 0, category_id: categories[0]?.id || '', description: '', actif: true })
      fetchData()
    } else {
      alert('Erreur: ' + error.message)
    }
    setIsSaving(false)
  }

  const filteredProduits = produits.filter(p => 
    p.nom.toLowerCase().includes(search.toLowerCase()) || 
    p.categories?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="p-8 text-white font-mono text-xs">Chargement du catalogue...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
             <Package className="text-orange-500" size={32} />
             Produits
          </h1>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Gérer votre catalogue et vos stocks</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
           >
             <Plus size={20} /> Ajout Rapide
           </button>
        </div>
      </header>

      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
         <div className="p-6 border-b border-slate-800 bg-slate-800/20">
            <div className="relative max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
               <input 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 placeholder="Rechercher un produit ou catégorie..." 
                 className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-white text-sm font-bold focus:border-orange-500 outline-none transition-all"
               />
            </div>
         </div>
         <ProductList produits={filteredProduits} />
      </div>

      {/* Quick Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajout Rapide de Produit" maxWidth="max-w-md">
         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom du produit</label>
               <input 
                 className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-4 text-white font-black focus:border-orange-500 outline-none transition-all"
                 placeholder="Ex: Robe d'été Fleurie"
                 value={newProduct.nom}
                 onChange={e => setNewProduct({...newProduct, nom: e.target.value})}
               />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Catégorie</label>
               <select 
                 className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-4 text-white font-black outline-none h-14"
                 value={newProduct.category_id}
                 onChange={e => setNewProduct({...newProduct, category_id: e.target.value})}
               >
                 {categories.map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prix (FCFA)</label>
                  <input 
                    type="number"
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-4 text-white font-black focus:border-orange-500 outline-none"
                    value={newProduct.prix || ''}
                    onChange={e => setNewProduct({...newProduct, prix: parseInt(e.target.value)})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stock Initial</label>
                  <input 
                    type="number"
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-4 text-white font-black focus:border-orange-500 outline-none"
                    value={newProduct.quantite || ''}
                    onChange={e => setNewProduct({...newProduct, quantite: parseInt(e.target.value)})}
                  />
               </div>
            </div>

            <button 
              onClick={handleQuickAdd}
              disabled={isSaving}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
              Créer le produit
            </button>
         </div>
      </Modal>
    </div>
  )
}
