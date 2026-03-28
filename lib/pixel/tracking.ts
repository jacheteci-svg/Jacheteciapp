import * as pixel from './browser'

export const trackViewContent = (produit: any) => {
  pixel.event('ViewContent', {
    content_name: produit.nom,
    content_category: produit.categories?.name,
    content_ids: [produit.id],
    content_type: 'product',
    value: produit.prix,
    currency: 'XOF'
  })
}

export const trackAddToCart = (produit: any, quantity: number = 1) => {
  pixel.event('AddToCart', {
    content_name: produit.nom,
    content_ids: [produit.id],
    content_type: 'product',
    value: produit.prix * quantity,
    currency: 'XOF'
  })
}

// Purchase is handled via CAPI on the server for better reliability
// But we still fire a browser event for matching
export const trackPurchase = (produit: any, quantity: number, commandeId: string) => {
  pixel.event('Purchase', {
    content_name: produit.nom,
    content_ids: [produit.id],
    content_type: 'product',
    value: produit.prix * quantity,
    currency: 'XOF',
    event_id: commandeId // Essential for deduplication
  })
}
