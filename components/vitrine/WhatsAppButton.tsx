export default function WhatsAppButton() {
  return (
    <a 
      href="https://wa.me/2250506844901?text=Bonjour, je souhaite avoir plus d'informations."
      target="_blank"
      className="fixed bottom-6 right-6 z-[60] bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 active:scale-90 transition-transform hover:rotate-12"
    >
      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M12.031 6.172c-2.311 0-4.189 1.878-4.189 4.189 0 2.308 1.878 4.189 4.189 4.189 2.311 0 4.19-1.881 4.19-4.189S14.342 6.172 12.031 6.172zm0 7.378c-1.758 0-3.189-1.431-3.189-3.189s1.431-3.189 3.189-3.189 3.189 1.431 3.189 3.189-1.431 3.189-3.189 3.189zM12.031 2C6.49 2 2 6.49 2 12.03c0 1.731.438 3.356 1.206 4.778l-1.206 4.4 4.541-1.191a10.031 10.031 0 004.49 1.053c5.541 0 10.031-4.49 10.031-10.031C22.063 6.49 17.573 2 12.031 2zm0 18c-1.631 0-3.147-.469-4.416-1.275l-2.612.684.697-2.544c-.934-1.325-1.488-2.934-1.488-4.666 0-4.413 3.587-8 8-8s8 3.587 8 8-3.587 8-8 8z" />
      </svg>
    </a>
  )
}
