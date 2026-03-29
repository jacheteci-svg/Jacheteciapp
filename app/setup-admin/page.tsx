'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Terminal } from 'lucide-react'

const SETUP_KEY = 'JACHETE_ADMIN_2026'

function AdminSetupContent() {
  const searchParams = useSearchParams()
  const key = searchParams.get('key')
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [debug, setDebug] = useState<string>('')
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (key === SETUP_KEY) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [key])

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDebug('')

    try {
      console.log("--- START SETUP ---")
      console.log("Target Email:", email)
      
      const response = await (supabase.auth as any).signUp({
        email,
        password,
        name: fullName
      })

      console.log("RAW AUTH RESPONSE:", response)
      setDebug(JSON.stringify(response, null, 2))

      const signUpData = response.data
      const signUpError = response.error

      // Handle shim-level error (HTTP != 2xx)
      if (signUpError) {
        const msg = typeof signUpError === 'string' ? signUpError : signUpError.message || JSON.stringify(signUpError)
        throw new Error(`Erreur API: ${msg}`)
      }

      // Handle nested error (HTTP == 200 but error in JSON)
      const data = signUpData?.data || signUpData
      const nestedError = signUpData?.error || data?.error
      
      if (nestedError) {
        throw new Error(`Erreur Interne: ${nestedError.message || JSON.stringify(nestedError)}`)
      }

      // Find user in possible locations
      const user = data?.user || signUpData?.user
      
      if (user) {
        console.log("User detected:", user.id)
        
        // 2. Create Profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: email,
            full_name: fullName,
            role: 'SUPER_ADMIN',
            permissions: {
              staff: true, revenue: true, settings: true, dashboard: true, inventory: true, establishments: true
            }
          })

        if (profileError) {
          throw new Error(`Erreur Profil: ${profileError.message || JSON.stringify(profileError)}`)
        }
        
        setSuccess(true)
        setTimeout(() => { router.push('/login') }, 3000)
      } else {
        // If we reach here, we have success but no user. 
        // Is it because email verification is required?
        if (data?.requireEmailVerification) {
          setError("Vérification d'email requise. Un code ou un lien a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception (et vos spams) avant de vous connecter.")
        } else {
          throw new Error("Le compte a été créé, mais aucune donnée utilisateur n'a été reçue. Veuillez essayer de vous connecter.")
        }
      }
    } catch (err: any) {
      console.error("Setup error catch:", err)
      setError(err.message || "Une erreur inconnue est survenue.")
    } finally {
      setLoading(false)
    }
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="text-red-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Accès Non Autorisé</h1>
        </div>
      </div>
    )
  }

  if (isAuthorized === null) return null

  return (
    <div className="min-h-screen bg-[#030712] bg-mesh relative flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/50 to-[#030712] z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl space-y-8 overflow-hidden relative">
          <div className="text-center space-y-4">
            <div className="bg-orange-500 text-white w-16 h-16 rounded-3xl flex items-center justify-center font-black mx-auto text-3xl shadow-2xl">J</div>
            <h1 className="text-3xl font-black text-white">Setup Admin V2</h1>
            <p className="text-slate-400">Diagnostic de création de compte</p>
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <form onSubmit={handleCreateAdmin} className="space-y-6">
                <div className="space-y-4">
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-orange-500/50" placeholder="Nom Complet" value={fullName} onChange={e => setFullName(e.target.value)} />
                  <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-orange-500/50" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                  <input required type="password" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-orange-500/50" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="text-red-400 shrink-0" size={18} />
                    <p className="text-red-400 text-sm font-bold">{error}</p>
                  </div>
                )}

                <button disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3">
                  {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "TENTER LA CRÉATION"}
                </button>
              </form>
            ) : (
              <div className="text-center py-10 space-y-6">
                <CheckCircle2 className="text-green-500 w-20 h-20 mx-auto" />
                <h2 className="text-2xl font-bold text-white">Succès !</h2>
                <p className="text-slate-400">Compte créé. Redirection...</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {debug && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl mt-8 relative z-10"
        >
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] overflow-hidden">
            <div className="flex items-center gap-2 mb-4 text-slate-400 font-mono text-xs uppercase tracking-widest">
              <Terminal size={14} />
              Debug Output
            </div>
            <pre className="text-green-400 font-mono text-xs overflow-auto max-h-[300px] p-4 bg-black/40 rounded-xl">
              {debug}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function AdminSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712] flex items-center justify-center"><div className="w-10 h-10 border-4 border-t-orange-500 rounded-full animate-spin" /></div>}>
      <AdminSetupContent />
    </Suspense>
  )
}
