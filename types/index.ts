export type StatutCommande = 'nouveau' | 'confirme' | 'en_cours' | 'livre' | 'annule'

export interface Categorie {
  id: string
  nom: string
  slug: string
  actif: boolean
  created_at: string
}

export interface Produit {
  id: string
  nom: string
  slug: string
  description: string | null
  prix: number
  prix_barre: number | null
  categorie_id: string
  quantite: number
  seuil_alerte: number
  actif: boolean
  ordre: number
  meta_title: string | null
  meta_desc: string | null
  created_at: string
  updated_at: string
}

export interface ProduitPhoto {
  id: string
  produit_id: string
  url: string
  est_principale: boolean
  ordre: number
  created_at: string
}

export interface Client {
  id: string
  nom: string
  telephone: string
  quartier: string | null
  total_commandes: number
  total_depense: number
  statut: 'nouveau' | 'regulier' | 'vip' | 'blackliste'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ZoneLivraison {
  id: string
  nom: string
  frais: number
  delai_estime: string | null
  actif: boolean
  created_at: string
}

export interface Commande {
  id: string
  client_id: string | null
  produit_id: string | null
  client_nom: string
  client_tel: string
  client_quartier: string
  quantite: number
  montant_total: number
  paiement_mode: 'livraison' | 'wave' | 'orange_money' | 'mtn_momo'
  statut: StatutCommande
  zone_id: string | null
  livreur_id: string | null
  code_promo_id: string | null
  notes: string | null
  event_id: string | null
  created_at: string
  updated_at: string
}

export interface PixelConfig {
  id: string
  pixel_id: string
  capi_token: string
  actif: boolean
  mode_test: boolean
  test_event_code: string | null
  updated_at: string
}
