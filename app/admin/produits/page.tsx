'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProductList from '@/components/admin/Produits/ProductList'
import ProductForm from '@/components/admin/Produits/ProductForm'
import { Plus, Search, Package, Save, Loader2, X } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'

function AdminProduitsContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [produits, setProduits] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  
  // Modal state
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
    // Clear search param if it exists
    if (searchParams.get('edit')) {
      router.push('/admin/produits')
    }
    fetchData()
  }

  const filteredProduits = produits.filter(p => 
    p.nom.toLowerCase().includes(search.toLowerCase()) || 
    p.categories?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading && produits.length === 0) return <div className="p-8 text-white font-mono text-xs">Chargement du catalogue...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-screen pb-20">
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
             onClick={handleOpenAdd}
             className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
           >
             <Plus size={20} /> Nouveau Produit
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
         <ProductList 
           produits={filteredProduits} 
           onEdit={handleEdit}
           onDelete={handleDelete}
         />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProduct ? "Modifier le produit" : "Ajouter un produit"} 
        maxWidth="max-w-5xl"
      >
         <div className="max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            <ProductForm 
              categories={categories} 
              initialData={editingProduct} 
              onSuccess={handleFormSuccess}
            />
         </div>
      </Modal>
    </div>
  )
}

export default function AdminProduitsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white font-mono text-xs">Initialisation...</div>}>
      <AdminProduitsContent />
    </Suspense>
  )
}
