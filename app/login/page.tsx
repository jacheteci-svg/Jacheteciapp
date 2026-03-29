'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data?.requireEmailVerification) {
        setStep('verify')
        return
      }

      if (data?.accessToken) {
        router.push('/admin')
        router.refresh()
      } else {
        throw new Error("Une erreur est survenue lors de la connexion.")
      }
    } catch (err: any) {
      setError(err.message || "Identifiants incorrects.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError("Veuillez saisir un code à 6 chiffres.")
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error } = await (supabase.auth as any).verifyEmail({
        email,
        otp
      })

      if (error) throw error

      if (data?.accessToken) {
        router.push('/admin')
        router.refresh()
      } else {
        throw new Error("Vérification réussie mais session non reçue.")
      }
    } catch (err: any) {
      console.error("Login verify error:", err)
      const msg = err.message || err.error || (typeof err === 'string' ? err : "Code invalide ou expiré.")
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await (supabase.auth as any).resendVerificationEmail({ email })
      if (error) throw error
      alert("Code renvoyé !")
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-orange-500 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black mx-auto text-2xl shadow-lg shadow-orange-500/20">J</div>
          <h1 className="text-3xl font-black text-white">
            {step === 'form' ? 'Connexion Admin' : 'Vérification'}
          </h1>
          <p className="text-slate-400 font-medium">
            {step === 'form' ? 'Accéder au back-office JACHETE.CI' : 'Saisissez le code reçu par email'}
          </p>
        </div>

        {step === 'form' ? (
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
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-4">
              <input 
                required 
                type="text" 
                maxLength={6}
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-6 text-white text-center text-3xl font-black tracking-[0.5rem] outline-none focus:border-orange-500 transition-all" 
                placeholder="000000" 
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
              />
            </div>

            {error && <p className="text-red-400 text-sm font-bold text-center">{error}</p>}

            <div className="space-y-3">
              <button 
                disabled={loading}
                className="w-full bg-orange-500 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? "Chargement..." : "VÉRIFIER LE CODE"}
              </button>
              <button 
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="w-full bg-slate-800 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-700 transition-all"
              >
                Renvoyer le code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
