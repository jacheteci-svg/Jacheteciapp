import { redirect } from 'next/navigation'

export default async function EditProduitPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Redirect to the main produits page with the edit query parameter
  // We'll handle opening the modal in the main Page.tsx
  redirect(`/admin/produits?edit=${id}`)
}
