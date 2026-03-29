'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Sparkles, KeyRound } from 'lucide-react'

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Sign Up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        name: fullName
      })

      if (signUpError) throw signUpError

      // Check if verification is required
      if (signUpData?.requireEmailVerification) {
        setStep('verify')
        return
      }

      // If no verification required (auto-confirmed), proceed to sync and login
      if (signUpData?.user) {
        await syncProfile(signUpData.user.id)
      }

      await autoLogin()
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'inscription.")
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
      const { data, error: verifyError } = await (supabase.auth as any).verifyEmail({
        email,
        otp
      })

      if (verifyError) throw verifyError

      if (data?.user) {
        await syncProfile(data.user.id)
        router.push('/admin')
        router.refresh()
      } else {
        throw new Error("Vérification réussie mais utilisateur non trouvé.")
      }
    } catch (err: any) {
      setError(err.message || "Code invalide ou expiré.")
    } finally {
      setLoading(false)
    }
  }

  const syncProfile = async (userId: string) => {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: email.trim().toLowerCase(),
        full_name: fullName,
        role: 'ADMIN'
      })

    if (profileError) {
      console.error("Profile sync error:", profileError)
    }
  }

  const autoLogin = async () => {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      setError("Compte créé, mais erreur de connexion automatique. Veuillez vous connecter.")
      setTimeout(() => router.push('/login'), 2000)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  const handleResendCode = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await (supabase.auth as any).resendVerificationEmail({ email })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] bg-mesh relative flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/50 to-[#030712] z-0" />
      <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-brand-secondary/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass border-white/5 p-8 md:p-12 rounded-[3rem] shadow-2xl space-y-10 overflow-hidden relative group">
           {/* Decorative elements */}
           <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl group-hover:bg-brand-primary/20 transition-all duration-1000" />
           
           <div className="text-center space-y-4 relative z-10">
             <motion.div 
               initial={{ scale: 0.8 }}
               animate={{ scale: 1 }}
               className="bg-brand-primary text-white w-20 h-20 rounded-[2rem] flex items-center justify-center font-black mx-auto text-4xl shadow-2xl shadow-brand-primary/20 rotate-3"
             >
               J
             </motion.div>
             <div className="space-y-1">
               <h1 className="text-4xl font-black text-white tracking-tighter italic">
                 {step === 'form' ? 'Inscription' : 'Vérification'}
               </h1>
               <div className="flex items-center justify-center gap-2 text-brand-primary font-black text-[10px] uppercase tracking-[0.4em]">
                  <Sparkles size={12} /> SYSTÈME ADMINISTRATEUR
               </div>
             </div>
           </div>

           <AnimatePresence mode="wait">
             {step === 'form' ? (
               <motion.form 
                 key="form"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 onSubmit={handleRegister} 
                 className="space-y-6 relative z-10"
               >
                 <div className="space-y-5">
                   <div className="relative group/field">
                     <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-brand-primary transition-colors" size={20} />
                     <input 
                       required
                       type="text"
                       className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-white outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all font-bold placeholder:text-slate-600"
                       placeholder="Nom Complet"
                       value={fullName}
                       onChange={e => setFullName(e.target.value)}
                     />
                   </div>

                   <div className="relative group/field">
                     <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-brand-primary transition-colors" size={20} />
                     <input 
                       required
                       type="email"
                       className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-white outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all font-bold placeholder:text-slate-600"
                       placeholder="Email Professionnel"
                       value={email}
                       onChange={e => setEmail(e.target.value)}
                     />
                   </div>

                   <div className="relative group/field">
                     <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-brand-primary transition-colors" size={20} />
                     <input 
                       required
                       type="password"
                       className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-white outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all font-bold placeholder:text-slate-600"
                       placeholder="Mot de passe"
                       value={password}
                       onChange={e => setPassword(e.target.value)}
                     />
                   </div>
                 </div>

                 {error && (
                   <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                     <AlertCircle className="text-red-400 shrink-0" size={18} />
                     <p className="text-red-400 text-[11px] font-black uppercase tracking-tight">{error}</p>
                   </div>
                 )}

                 <button 
                   disabled={loading}
                   className="group w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black py-5 rounded-2xl shadow-2xl shadow-brand-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 text-xs uppercase tracking-widest"
                 >
                   {loading ? (
                     <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                   ) : (
                     <>
                       CRÉER MON COMPTE <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </>
                   )}
                 </button>

                 <div className="pt-4 flex flex-col items-center gap-4">
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                     DÉJÀ MEMBRE ?{' '}
                     <Link href="/login" className="text-brand-primary hover:text-white transition-colors">SE CONNECTER</Link>
                   </p>
                 </div>
               </motion.form>
             ) : (
               <motion.form 
                 key="verify"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 onSubmit={handleVerifyOtp} 
                 className="space-y-6 relative z-10"
               >
                 <div className="text-center space-y-6">
                   <p className="text-slate-400 text-xs font-medium px-4">Un code de sécurité a été envoyé à <strong>{email}</strong></p>
                   <div className="relative">
                      <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary/50" size={24} />
                      <input 
                        required 
                        type="text" 
                        maxLength={6}
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-8 text-white text-center text-4xl font-black tracking-[1rem] outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all" 
                        placeholder="000000" 
                        value={otp} 
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                      />
                   </div>
                 </div>

                 {error && (
                   <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                     <AlertCircle className="text-red-400 shrink-0" size={18} />
                     <p className="text-red-400 text-[11px] font-black uppercase tracking-tight">{error}</p>
                   </div>
                 )}

                 <div className="space-y-4">
                   <button disabled={loading} className="w-full bg-brand-primary text-white font-black py-5 rounded-2xl shadow-2xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest">
                     {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Vérifier le code"}
                   </button>
                   <button type="button" onClick={handleResendCode} className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                     RENVOYER LE CODE
                   </button>
                 </div>
               </motion.form>
             )}
           </AnimatePresence>

           <div className="pt-2 flex items-center justify-center gap-3 text-slate-700 text-[8px] font-black uppercase tracking-[0.4em]">
             <ShieldCheck size={12} /> ACCÈS SÉCURISÉ AES-256
           </div>
        </div>
      </motion.div>
    </div>
  )
}
