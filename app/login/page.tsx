'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError("Identifiants incorrects.")
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-orange-500 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black mx-auto text-2xl shadow-lg shadow-orange-500/20">J</div>
          <h1 className="text-3xl font-black text-white">Connexion Admin</h1>
          <p className="text-slate-400 font-medium">Accéder au back-office JACHETE.CI</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email</label>
            <input 
              required
              type="email"
              className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none"
              placeholder="admin@jachete.ci"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Mot de passe</label>
            <input 
              required
              type="password"
              className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-sm font-bold text-center">{error}</p>}

          <button 
            disabled={loading}
            className="w-full bg-orange-500 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Chargement..." : "SE CONNECTER"}
          </button>
        </form>
      </div>
    </div>
  )
}
