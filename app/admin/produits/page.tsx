'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProductList from '@/components/admin/Produits/ProductList'
import ProductForm from '@/components/admin/Produits/ProductForm'
import { Plus, Search, Package, Save, Loader2, X, Filter } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import { motion, AnimatePresence } from 'framer-motion'

function AdminProduitsContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [produits, setProduits] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  useEffect(() => {
    fetchData().then(() => {
      const editId = searchParams.get('edit')
      if (editId) {
        handleOpenEditById(editId)
      }
    })
  }, [searchParams])

  const fetchData = async () => {
    setLoading(true)
    const [pRes, cRes] = await Promise.all([
      supabase.from('produits').select('*, categories(name), produit_photos(url)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name', { ascending: true })
    ])
    if (pRes.data) setProduits(pRes.data)
    if (cRes.data) setCategories(cRes.data)
    setLoading(false)
  }

  const handleOpenEditById = async (id: string) => {
    const { data: product } = await supabase
      .from('produits')
      .select('*, produit_photos(*), product_variants(*)')
      .eq('id', id)
      .single()
    
    if (product) {
      setEditingProduct(product)
      setIsModalOpen(true)
    }
  }

  const handleEdit = (product: any) => {
    handleOpenEditById(product.id)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.')) {
      setLoading(true)
      const { error } = await supabase.from('produits').delete().eq('id', id)
      if (error) {
        alert('Erreur lors de la suppression: ' + error.message)
      } else {
        fetchData()
      }
      setLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleFormSuccess = () => {
    setIsModalOpen(false)
    if (searchParams.get('edit')) {
      router.push('/admin/produits')
    }
    fetchData()
  }

  const filteredProduits = produits.filter(p => 
    p.nom.toLowerCase().includes(search.toLowerCase()) || 
    p.categories?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-brand-primary font-black text-[10px] uppercase tracking-[0.3em] mb-2">
             <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" /> Inventory Control
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">Produits</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.1em] text-xs">Catalogue & Gestion des Stocks</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleOpenAdd}
            className="bg-white text-background px-8 py-4 rounded-[1.2rem] font-black text-sm flex items-center gap-3 transition-all shadow-xl shadow-white/5 hover:scale-105 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            AJOUTER UN PRODUIT
          </button>
        </div>
      </header>

      <div className="space-y-8">
        <div className="glass p-8 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between">
           <div className="relative w-full md:max-w-xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="RECHERCHER UN PRODUIT..." 
                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-16 pr-6 py-4 text-white text-sm font-black focus:border-brand-primary outline-none transition-all placeholder:text-slate-700 uppercase tracking-widest"
              />
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <button className="flex-1 md:flex-none glass border-white/5 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">
                 <Filter size={16} /> Filtres
              </button>
           </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl shadow-black/40"
        >
          {loading && produits.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <Loader2 className="mx-auto text-brand-primary animate-spin" size={48} />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Synchronisation du catalogue...</p>
            </div>
          ) : (
            <ProductList 
              produits={filteredProduits} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            title={editingProduct ? "MODIFIER PRODUIT" : "NOUVEAU PRODUIT"} 
            maxWidth="max-w-6xl"
          >
             <div className="max-h-[85vh] overflow-y-auto pr-4 custom-scrollbar">
                <ProductForm 
                  categories={categories} 
                  initialData={editingProduct} 
                  onSuccess={handleFormSuccess}
                />
             </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminProduitsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-slate-500 font-black text-[10px] uppercase tracking-[0.5em]">Initialisation...</div>}>
      <AdminProduitsContent />
    </Suspense>
  )
}

