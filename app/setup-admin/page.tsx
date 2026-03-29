'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Terminal, Check } from 'lucide-react'

const SETUP_KEY = 'JACHETE_ADMIN_2026'

function AdminSetupContent() {
  const searchParams = useSearchParams()
  const key = searchParams.get('key')
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [debugError, setDebugError] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [debug, setDebug] = useState<string>('')
  
  const supabase = createClient()

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
      const response = await (supabase.auth as any).signUp({
        email,
        password,
        name: fullName
      })

      const signUpData = response.data
      const signUpError = response.error

      if (signUpError) {
        const msg = typeof signUpError === 'string' ? signUpError : signUpError.message || JSON.stringify(signUpError)
        throw new Error(`Erreur API: ${msg}`)
      }

      const data = signUpData?.data || signUpData
      
      if (data?.requireEmailVerification) {
        setStep('verify')
        return
      }

      const user = data?.user || signUpData?.user
      if (user) {
        await syncAdminTables(user.id)
      } else {
        throw new Error("Compte créé mais utilisateur non reçu.")
      }
    } catch (err: any) {
      handleError(err)
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
      console.log("[SetupAdmin] Tentative de vérification OTP:", { email, otp });
      const { data, error: verifyError } = await (supabase.auth as any).verifyEmail({
        email,
        otp
      })

      if (verifyError) {
        console.error("[SetupAdmin] Erreur de vérification OTP:", verifyError);
        throw verifyError
      }

      console.log("[SetupAdmin] Vérification réussie:", data);

      // Get full user data if not in verify response
      let user = data?.user
      if (!user) {
        console.log("[SetupAdmin] Utilisateur non présent dans la réponse, récupération via getUser...");
        const { data: userData, error: userError } = await (supabase.auth as any).getUser()
        if (userError) throw userError
        user = userData?.user
      }

      if (user) {
        console.log("[SetupAdmin] Synchronisation des tables pour l'utilisateur:", user.id);
        await syncAdminTables(user.id)
      } else {
        throw new Error("Vérification réussie mais utilisateur non trouvé.")
      }
    } catch (err: any) {
      handleError(err)
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
    } catch (err: any) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const syncAdminTables = async (userId: string) => {
    try {
      // 1. Update/Create Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email.trim().toLowerCase(),
          full_name: fullName,
          role: 'SUPER_ADMIN',
          permissions: {
            staff: true, revenue: true, settings: true, dashboard: true, inventory: true, establishments: true
          }
        })

      if (profileError) {
        console.error("Profile sync error:", profileError)
      }

      // 2. Update/Create utilisateurs_admin (used by dashboard filters)
      const { error: adminError } = await supabase
        .from('utilisateurs_admin')
        .upsert({
          id: userId,
          nom: fullName,
          email: email.trim().toLowerCase(),
          role: 'SUPER_ADMIN',
          actif: true
        })

      if (adminError) {
        console.error("Admin table sync error:", adminError)
        if (profileError) throw new Error("Erreur de synchronisation des tables administrateur.")
      }

      setShowModal(true)
    } catch (e) {
      throw e
    }
  }

  const handleError = (err: any) => {
    console.error("Setup error details:", err)
    let msg = ""
    if (typeof err === 'string') {
      msg = err
    } else if (err && typeof err === 'object') {
      msg = err.message || err.error || (JSON.stringify(err) !== '{}' ? JSON.stringify(err) : String(err))
    } else {
      msg = String(err)
    }

    setDebugError(msg)

    if (msg.includes("ALREADY_EXISTS") || msg.toLowerCase().includes("exists")) {
      setError("Ce compte existe déjà. Veuillez utiliser la page de connexion.")
    } else if (msg.includes("Invalid or expired") || msg.includes("INVALID_INPUT")) {
      setError("Le code est invalide ou a expiré. Veuillez vérifier votre email.")
    } else {
      setError("Une erreur est survenue lors de la vérification. Veuillez réessayer.")
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
            <p className="text-slate-400">
              {step === 'form' ? 'Diagnostic de création de compte' : 'Vérification de votre email'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleCreateAdmin} 
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white outline-none focus:border-orange-500/50" placeholder="Nom Complet" value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white outline-none focus:border-orange-500/50" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input required type="password" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white outline-none focus:border-orange-500/50" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-2">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="text-red-400 shrink-0" size={18} />
                      <p className="text-red-400 text-sm font-bold">{error}</p>
                    </div>
                    {debugError && (
                      <p className="text-[10px] text-red-400/50 font-mono break-all pl-7">
                        {debugError}
                      </p>
                    )}
                  </div>
                )}

                <button disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3">
                  {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "TENTER LA CRÉATION"}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleVerifyOtp} 
                className="space-y-6"
              >
                <div className="text-center space-y-4">
                  <p className="text-slate-400 text-sm">Nous avons envoyé un code à 6 chiffres à <strong>{email}</strong></p>
                  <input 
                    required 
                    type="text" 
                    maxLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-6 text-white text-center text-4xl font-black tracking-[1rem] outline-none focus:border-orange-500/50" 
                    placeholder="000000" 
                    value={otp} 
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-2">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="text-red-400 shrink-0" size={18} />
                      <p className="text-red-400 text-sm font-bold">{error}</p>
                    </div>
                    {debugError && (
                      <p className="text-[10px] text-red-400/50 font-mono break-all pl-7">
                        {debugError}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <button disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3 uppercase">
                    {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Vérifier le code"}
                  </button>
                  <button 
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-4 rounded-2xl transition-all"
                  >
                    Renvoyer le code
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Modal de Succès */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-[#111827] border border-white/10 p-10 rounded-[2.5rem] max-w-sm w-full text-center space-y-8 shadow-2xl shadow-green-500/10"
            >
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-12 h-12 text-green-500" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-white">Félicitations !</h3>
                <p className="text-slate-400 leading-relaxed">
                  Votre compte administrateur est maintenant activé et prêt à l'emploi.
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-wider"
              >
                Accéder au Dashboard
                <ArrowRight size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
