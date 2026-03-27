
import Head from 'next/head'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'product'
  price?: number
  currency?: string
}

export default function SEO({ 
  title = "JACHETE.CI - Votre boutique premium à Abidjan", 
  description = "Achetez les meilleurs produits au meilleur prix sur JACHETE.CI. Livraison rapide à Abidjan et partout en Côte d'Ivoire.",
  image = "/logo.png",
  url = "https://jachete.ci",
  type = "website",
  price,
  currency = "XOF"
}: SEOProps) {
  const siteTitle = title.includes("JACHETE.CI") ? title : `${title} | JACHETE.CI`
  
  return (
    <>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Product Specific */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
        </>
      )}

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": type === 'product' ? 'Product' : 'Store',
            "name": siteTitle,
            "description": description,
            "image": image,
            ...(type === 'product' && price ? {
              "offers": {
                "@type": "Offer",
                "price": price,
                "priceCurrency": currency,
                "availability": "https://schema.org/InStock",
                "url": url
              }
            } : {})
          })
        }}
      />
    </>
  )
}
