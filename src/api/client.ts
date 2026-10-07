const baseUrl: string = import.meta.env.VITE_API_URL ?? ''

type AuthHandlers = {
  getToken: () => Promise<string | null>
  onUnauthorized: () => void
}

let auth: AuthHandlers | null = null

// Set by the AuthProvider: every request carries the logged user's token.
export function configureAuth(handlers: AuthHandlers | null) {
  auth = handlers
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await auth?.getToken()
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (response.status === 401) {
    auth?.onUnauthorized()
  }
  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response))
  }
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

export function queryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value)
    }
  }
  const encoded = search.toString()
  return encoded ? `?${encoded}` : ''
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string }
    return body.error ?? response.statusText
  } catch {
    return response.statusText
  }
}
