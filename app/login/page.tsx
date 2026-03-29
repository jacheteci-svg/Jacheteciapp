'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Sparkles, KeyRound } from 'lucide-react'

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

      if (data?.session) {
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

      if (data?.session) {
        router.push('/admin')
        router.refresh()
      } else {
        throw new Error("Vérification réussie mais session non reçue.")
      }
    } catch (err: any) {
      setError(err.message || "Code invalide ou expiré.")
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
      setError(err.message || "Erreur lors de l'envoi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] bg-mesh relative flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/50 to-[#030712] z-0" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass border-white/5 p-8 md:p-12 rounded-[3rem] shadow-2xl space-y-10 overflow-hidden relative group">
           <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl group-hover:bg-brand-primary/20 transition-all duration-1000" />
           
           <div className="text-center space-y-4 relative z-10">
             <div className="bg-orange-500 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black mx-auto text-3xl shadow-2xl rotate-3">J</div>
             <div className="space-y-1">
               <h1 className="text-3xl font-black text-white tracking-tighter italic">
                 {step === 'form' ? 'Connexion Admin' : 'Vérification'}
               </h1>
               <div className="flex items-center justify-center gap-2 text-brand-primary font-black text-[9px] uppercase tracking-[0.4em]">
                  <Sparkles size={10} /> ACCÈS RÉSERVÉ
               </div>
             </div>
           </div>

           <AnimatePresence mode="wait">
             {step === 'form' ? (
               <motion.form 
                 key="login"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 onSubmit={handleLogin} 
                 className="space-y-6 relative z-10"
               >
                 <div className="space-y-4">
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
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                     <AlertCircle className="text-red-400 shrink-0" size={18} />
                     <p className="text-red-400 text-[11px] font-black uppercase tracking-tight">{error}</p>
                   </motion.div>
                 )}

                 <button disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 text-xs uppercase tracking-widest">
                   {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>ACCÉDER AU DASHBOARD <ArrowRight size={18} /></>}
                 </button>

                 <div className="pt-4 text-center">
                   <Link href="/register" className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-brand-primary transition-colors">
                     PAS ENCORE DE COMPTE ? S'INSCRIRE
                   </Link>
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
             <ShieldCheck size={12} /> INFRASTRUCTURE SÉCURISÉE J'ACHÈTE.CI
           </div>
        </div>
      </motion.div>
    </div>
  )
}
