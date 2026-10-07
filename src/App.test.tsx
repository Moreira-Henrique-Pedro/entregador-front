import { screen, waitFor } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { FakeAuthClient, doorman, noRole, validToken } from './test/fakeAuth'
import { renderWithProviders } from './test/render'
import { apiUrl, server } from './test/server'

async function logIn(user: UserEvent, email: string, password: string) {
  await user.type(await screen.findByLabelText(/E-mail/), email)
  await user.type(screen.getByLabelText(/Senha/), password)
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('App', () => {
  it('asks for login before showing the deliveries', async () => {
    renderWithProviders(<App />, { auth: new FakeAuthClient() })

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('lets the doorman log in and manage the deliveries, sending the token to the API', async () => {
    let authorization: string | null = null
    server.use(
      http.get(`${apiUrl}/v1/deliveries`, ({ request }) => {
        authorization = request.headers.get('Authorization')
        return HttpResponse.json([])
      }),
    )
    const { user } = renderWithProviders(<App />, { auth: new FakeAuthClient() })

    await logIn(user, doorman.email, doorman.password)

    expect(await screen.findByText('Nenhuma entrega encontrada.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nova entrega' })).toBeInTheDocument()
    expect(authorization).toBe(`Bearer ${validToken}`)
  })

  it('shows an error when the email or password is wrong', async () => {
    const { user } = renderWithProviders(<App />, { auth: new FakeAuthClient() })

    await logIn(user, doorman.email, 'senha-errada')

    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('validates the form before calling the login', async () => {
    const { user } = renderWithProviders(<App />, { auth: new FakeAuthClient() })

    await user.click(await screen.findByRole('button', { name: 'Entrar' }))

    expect(screen.getByText('Informe um e-mail válido')).toBeInTheDocument()
    expect(screen.getByText('Informe a senha')).toBeInTheDocument()
  })

  it('keeps the session and logs out', async () => {
    const { user } = renderWithProviders(<App />, { auth: new FakeAuthClient(undefined, doorman) })

    expect(await screen.findByRole('table')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sair' }))

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('goes back to the login when the API rejects the session', async () => {
    server.use(http.get(`${apiUrl}/v1/deliveries`, () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })))
    renderWithProviders(<App />, { auth: new FakeAuthClient(undefined, doorman) })

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('blocks a user without the doorman or admin role', async () => {
    const { user } = renderWithProviders(<App />, { auth: new FakeAuthClient() })

    await logIn(user, noRole.email, noRole.password)

    expect(await screen.findByText('Sem permissão')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('table')).not.toBeInTheDocument())
  })

  describe('forgot password', () => {
    it('sends the reset link to the email typed in the login', async () => {
      const auth = new FakeAuthClient()
      const { user } = renderWithProviders(<App />, { auth })

      await user.type(await screen.findByLabelText(/E-mail/), doorman.email)
      await user.click(screen.getByRole('button', { name: 'Esqueceu a senha?' }))
      expect(screen.getByLabelText(/E-mail/)).toHaveValue(doorman.email)
      await user.click(screen.getByRole('button', { name: 'Enviar link' }))

      expect(await screen.findByText('Verifique seu e-mail')).toBeInTheDocument()
      expect(auth.passwordResets).toEqual([doorman.email])
    })

    it('asks for a valid email and goes back to the login', async () => {
      const auth = new FakeAuthClient()
      const { user } = renderWithProviders(<App />, { auth })

      await user.click(await screen.findByRole('button', { name: 'Esqueceu a senha?' }))
      await user.click(screen.getByRole('button', { name: 'Enviar link' }))
      expect(screen.getByText('Informe um e-mail válido')).toBeInTheDocument()
      expect(auth.passwordResets).toEqual([])

      await user.click(screen.getByRole('button', { name: 'Voltar para o login' }))
      expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
    })
  })
})
