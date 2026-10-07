import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { configureAuth } from '../api/client'
import type { AuthClient } from './authClient'
import { AuthContext, type AuthContextValue, type Session } from './useAuth'

export function AuthProvider({ client, children }: { client: AuthClient; children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session>({ status: 'loading' })

  useEffect(() => {
    // An expired or revoked session (401) sends the user back to the login.
    configureAuth({ getToken: () => client.getToken(), onUnauthorized: () => void client.signOut() })
    const unsubscribe = client.onSessionChange((user) => {
      if (!user) {
        // Do not show the previous user's data to the next one.
        queryClient.clear()
      }
      setSession(user ? { status: 'signedIn', user } : { status: 'signedOut' })
    })
    return () => {
      unsubscribe()
      configureAuth(null)
    }
  }, [client, queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      signIn: (email, password) => client.signIn(email, password),
      signOut: () => client.signOut(),
      sendPasswordReset: (email) => client.sendPasswordReset(email),
    }),
    [client, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
