export default function SocialProof() {
  const testimonials = [
    { name: "Mariam T.", text: "Livraison super rapide à Yopougon, produit conforme !", stars: 5 },
    { name: "Koffi A.", text: "Excellent service client, je recommande JACHETE.CI", stars: 5 },
    { name: "Sita D.", text: "Le paiement à la livraison m'a rassuré. Merci !", stars: 5 },
  ]

  return (
    <section className="px-4 py-8 space-y-8 bg-slate-50 border-y border-slate-100">
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex -space-x-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
               <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
            </div>
          ))}
        </div>
        <div className="text-sm font-bold text-slate-700">
          🛒 <span className="text-orange-600">42 personnes</span> ont commandé cette semaine
        </div>
      </div>

      <div className="space-y-4">
        {testimonials.map((t, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">{t.name}</span>
              <div className="flex text-yellow-400 text-xs">
                {"★".repeat(t.stars)}
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-snug italic">"{t.text}"</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-3 rounded-xl border border-green-100 font-bold text-sm">
        <span className="text-xl">✅</span> Paiement à la livraison accepté
      </div>
    </section>
  )
}
