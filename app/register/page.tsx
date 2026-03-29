'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Sign Up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      name: fullName
    })

    if (signUpError) {
      setError(signUpError.message || "Erreur lors de l'inscription.")
      setLoading(false)
      return
    }

    // 2. Create Profile (Manual sync since we don't have a DB trigger)
    if (signUpData?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: signUpData.user.id,
          email: email,
          full_name: fullName,
          role: 'ADMIN' // Default for now based on project context
        })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        // We don't block the user if only the profile fails, but it might cause issues later
      }
    }

    // 3. Log In automatically
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      setError("Compte créé, mais erreur de connexion automatique. Veuillez vous connecter.")
      setLoading(false)
      setTimeout(() => router.push('/login'), 2000)
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
          <h1 className="text-3xl font-black text-white">Inscription</h1>
          <p className="text-slate-400 font-medium text-sm">Créer un compte administrateur JACHETE.CI</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Nom Complet</label>
            <input 
              required
              type="text"
              className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none"
              placeholder="Ex: Jean Kouassi"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email</label>
            <input 
              required
              type="email"
              className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all outline-none"
              placeholder="votre@email.com"
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
            {loading ? "Chargement..." : "S'INSCRIRE"}
          </button>

          <p className="text-center text-slate-400 text-sm">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-orange-500 font-bold hover:underline">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
