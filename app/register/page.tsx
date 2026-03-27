'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // Wait a bit and redirect to login
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-brand-primary text-white w-12 h-12 rounded-xl flex items-center justify-center font-black mx-auto text-2xl shadow-lg shadow-brand-primary/20">J</div>
          <h1 className="text-3xl font-black text-white">Créer un profil Admin</h1>
          <p className="text-slate-400 font-medium whitespace-nowrap">Configuration des accès JACHETE.CI</p>
        </div>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center space-y-4">
             <div className="text-4xl">🎉</div>
             <p className="text-green-400 font-bold text-lg">Inscription réussie !</p>
             <p className="text-slate-400 text-sm">Vérifiez vos emails (et spams) pour confirmer votre compte, puis connectez-vous.</p>
             <div className="pt-4">
                <Link href="/login" className="text-brand-primary font-bold hover:underline">Aller à la page de connexion</Link>
             </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email</label>
              <input 
                required
                type="email"
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brand-primary transition-all outline-none"
                placeholder="votre-email@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Mot de passe</label>
              <input 
                required
                type="password"
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brand-primary transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-400 text-sm font-bold text-center">{error}</p>}

            <button 
              disabled={loading}
              className="w-full bg-brand-primary text-white font-black py-4 rounded-xl shadow-lg shadow-brand-primary/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Chargement..." : "CRÉER MON COMPTE ADMIN"}
            </button>
            <div className="text-center">
              <Link href="/login" className="text-slate-500 text-xs font-bold hover:text-slate-400 transition-colors uppercase tracking-widest">Retour à la connexion</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
