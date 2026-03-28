
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit2, Save, X, FolderTree, Search } from 'lucide-react'

export default function CategoriesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [search, setSearch] = useState('')
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: est } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (est) setEstablishmentId(est.id)
      }
      fetchCategories()
    }
    init()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    
    if (data) setCategories(data)
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!establishmentId) return
    const name = prompt('Nom de la nouvelle catégorie :')
    if (!name) return

    const { error } = await supabase
      .from('categories')
      .insert({ name, establishment_id: establishmentId })
    
    if (!error) fetchCategories()
    else alert(error.message)
  }

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .update({ name: editName, description: editDesc })
      .eq('id', id)
    
    if (!error) {
      setEditingId(null)
      fetchCategories()
    } else alert(error.message)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Cela peut affecter les produits liés.')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    if (!error) fetchCategories()
    else alert("Erreur : Cette catégorie est probablement utilisée par des produits.")
  }

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading && categories.length === 0) return <div className="p-8 text-white font-mono text-xs">Chargement...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
             <FolderTree className="text-blue-500" size={32} />
             Catégories
          </h1>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Organisez vos produits par sections</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus size={20} /> Nouvelle Catégorie
        </button>
      </header>

      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-4 md:p-6 space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
             placeholder="Rechercher une catégorie..."
             className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none transition-all"
             value={search}
             onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div key={c.id} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all group">
               {editingId === c.id ? (
                 <div className="space-y-4">
                    <input 
                      autoFocus
                      className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-white font-bold outline-none focus:border-blue-500"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                    <textarea 
                      className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-blue-500 resize-none"
                      placeholder="Description (optionnelle)"
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                    />
                    <div className="flex gap-2">
                       <button onClick={() => handleUpdate(c.id)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-black uppercase tracking-widest">Enregistrer</button>
                       <button onClick={() => setEditingId(null)} className="p-2 bg-slate-800 text-slate-400 rounded-lg"><X size={16} /></button>
                    </div>
                 </div>
               ) : (
                 <div className="h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                         <h3 className="text-lg font-black text-white">{c.name}</h3>
                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingId(c.id); setEditName(c.name); setEditDesc(c.description || '')
                              }}
                              className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                            >
                               <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                      <p className="text-slate-500 text-xs line-clamp-2">{c.description || 'Aucune description'}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ID: {c.id.slice(0,8)}...</span>
                    </div>
                 </div>
               )}
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-600 font-medium">
               Aucune catégorie trouvée.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
