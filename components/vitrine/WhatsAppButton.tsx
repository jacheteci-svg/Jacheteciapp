'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  return (
    <motion.a 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: 12 }}
      whileTap={{ scale: 0.9 }}
      href="https://wa.me/2250506844901?text=Bonjour, je souhaite avoir plus d'informations."
      target="_blank"
      className="fixed bottom-8 right-8 z-[60] bg-[#25D366] text-white w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_-10px_rgba(37,211,102,0.5)] active:scale-90 transition-shadow hover:shadow-[0_0_60px_-10px_rgba(37,211,102,0.8)]"
    >
      <div className="absolute inset-0 bg-[#25D366] rounded-[2rem] animate-ping opacity-20" />
      <MessageCircle size={32} strokeWidth={2.5} />
    </motion.a>
  )
}

