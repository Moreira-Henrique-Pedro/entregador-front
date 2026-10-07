import type { AuthClient, SessionUser } from '../auth/authClient'

type Account = SessionUser & { password: string }

export const doorman: Account = { email: 'porteiro@entregador.local', name: 'Porteiro', role: 'doorman', password: 'porteiro123' }
export const noRole: Account = { email: 'sem-papel@entregador.local', password: 'semPapel123' }

export const validToken = 'valid-token'

// In-memory stand-in for Firebase Auth, with the same error codes.
export class FakeAuthClient implements AuthClient {
  private listeners = new Set<(user: SessionUser | null) => void>()
  private readonly accounts: Account[]
  private current: SessionUser | null

  constructor(accounts: Account[] = [doorman, noRole], signedIn: Account | null = null) {
    this.accounts = accounts
    this.current = signedIn && toUser(signedIn)
  }

  onSessionChange(listener: (user: SessionUser | null) => void) {
    this.listeners.add(listener)
    queueMicrotask(() => listener(this.current))
    return () => {
      this.listeners.delete(listener)
    }
  }

  async signIn(email: string, password: string) {
    const account = this.accounts.find((a) => a.email === email && a.password === password)
    if (!account) {
      throw Object.assign(new Error('invalid credential'), { code: 'auth/invalid-credential' })
    }
    this.emit(toUser(account))
  }

  async signOut() {
    this.emit(null)
  }

  readonly passwordResets: string[] = []

  async sendPasswordReset(email: string) {
    this.passwordResets.push(email)
  }

  async getToken() {
    return this.current ? validToken : null
  }

  private emit(user: SessionUser | null) {
    this.current = user
    this.listeners.forEach((listener) => listener(user))
  }
}

function toUser({ email, name, role }: Account): SessionUser {
  return { email, name, role }
}
