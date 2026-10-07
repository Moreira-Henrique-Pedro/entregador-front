import { createContext, useContext } from 'react'
import type { SessionUser } from './authClient'

export type Session =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; user: SessionUser }

export type AuthContextValue = {
  session: Session
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}
