export type Role = 'admin' | 'doorman'

export type SessionUser = {
  email: string
  name?: string
  role?: string
}

// What the app needs from the login provider. Firebase in production, a fake in the tests.
export interface AuthClient {
  onSessionChange(listener: (user: SessionUser | null) => void): () => void
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
  sendPasswordReset(email: string): Promise<void>
  getToken(): Promise<string | null>
}

export const staffRoles: readonly Role[] = ['admin', 'doorman']

export function isStaff(user: SessionUser): boolean {
  return staffRoles.includes(user.role as Role)
}

// Firebase Auth error codes, translated for the login screen.
export function signInErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-email':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'E-mail ou senha incorretos.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique a internet e tente de novo.'
    case 'auth/user-disabled':
      return 'Este usuário foi desativado. Fale com o síndico.'
    default:
      return 'Não foi possível entrar. Tente de novo.'
  }
}

export function passwordResetErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code
  switch (code) {
    case 'auth/invalid-email':
      return 'Informe um e-mail válido.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique a internet e tente de novo.'
    default:
      return 'Não foi possível enviar o e-mail. Tente de novo.'
  }
}
