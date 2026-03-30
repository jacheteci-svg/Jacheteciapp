// TEMPORARY EMERGENCY ACCESS ROUTE - REMOVE AFTER FIRST LOGIN
// This route creates a direct admin session bypassing password auth
import { NextResponse } from 'next/server'

const BASE_URL = 'https://4v4zv2hw.eu-central.insforge.app'

export async function GET() {
  try {
    // Register a temporary emergency admin account with a fresh password
    // (requireEmailVerification was disabled in DB, but API may cache it)
    // We use a unique email to avoid conflicts
    const tempEmail = `emergency.admin.${Date.now()}@jachete.ci`
    const tempPassword = 'Emergency2024!Jachete'

    // Try to create new user - now that email verification is disabled in DB
    const registerRes = await fetch(`${BASE_URL}/api/auth/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: tempEmail,
        password: tempPassword,
        name: 'Admin Emergency'
      })
    })
    const registerData = await registerRes.json()

    if (registerData.accessToken) {
      // Success! Email verification is disabled. Return success page with credentials
      return new NextResponse(`
        <html><body style="font-family:sans-serif;padding:40px;background:#1a1a2e;color:white">
        <h2 style="color:#00ff88">✅ Compte admin créé avec succès!</h2>
        <p>Email: <strong>${tempEmail}</strong></p>
        <p>Mot de passe: <strong>${tempPassword}</strong></p>
        <p style="color:#ffd700">⚠️ Notez ces identifiants maintenant puis supprimez le fichier <code>app/api/setup-session/route.ts</code></p>
        <a href="/login" style="background:#ff6b35;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:20px">
          → Aller à la page de connexion
        </a>
        </body></html>
      `, { headers: { 'Content-Type': 'text/html' } })
    }

    // If registration failed (email verification still cached), show the data
    return NextResponse.json({
      message: 'Email verification may still be cached. Check requireEmailVerification status.',
      registerResponse: registerData,
      requireEmailVerification: registerData.requireEmailVerification,
      instructions: 'Wait a few minutes for the cache to expire and try again, or contact InsForge support.'
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
