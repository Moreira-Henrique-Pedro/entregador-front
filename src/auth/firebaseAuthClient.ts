import { initializeApp } from 'firebase/app'
import {
  connectAuthEmulator,
  getAuth,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import type { AuthClient } from './authClient'

export function firebaseAuthClient(): AuthClient {
  const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  })
  const auth = getAuth(app)

  // Locally, the emulator is reached through the Vite proxy (same origin as the page).
  if (import.meta.env.VITE_FIREBASE_AUTH_EMULATOR === 'true') {
    connectAuthEmulator(auth, window.location.origin, { disableWarnings: true })
  }

  return {
    onSessionChange: (listener) =>
      onIdTokenChanged(auth, async (user) => {
        if (!user) {
          listener(null)
          return
        }
        // The role is a custom claim the API sets when it creates the user.
        const { claims } = await user.getIdTokenResult()
        listener({
          email: user.email ?? '',
          name: user.displayName ?? undefined,
          role: typeof claims.role === 'string' ? claims.role : undefined,
        })
      }),
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password)
    },
    signOut: () => signOut(auth),
    sendPasswordReset: async (email) => {
      auth.languageCode = 'pt-BR'
      try {
        await sendPasswordResetEmail(auth, email)
      } catch (error) {
        // Do not tell who has an account: an unknown email looks like a sent one.
        if ((error as { code?: string }).code !== 'auth/user-not-found') {
          throw error
        }
      }
    },
    // The SDK renews the token (1 hour) by itself.
    getToken: async () => (auth.currentUser ? auth.currentUser.getIdToken() : null),
  }
}
