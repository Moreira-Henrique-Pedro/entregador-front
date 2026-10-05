import { screen, waitFor, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/render'
import { api, apiUrl, server } from '../../test/server'
import { DeliveriesPage } from './DeliveriesPage'

async function tableRows() {
  const table = await screen.findByRole('table')
  return within(table).getAllByRole('row').slice(1)
}

async function rowOf(text: string) {
  const rows = await tableRows()
  const row = rows.find((r) => within(r).queryByText(text))
  if (!row) throw new Error(`row with "${text}" not found`)
  return row
}

async function selectOption(user: UserEvent, input: HTMLElement, option: string) {
  await user.click(input)
  await user.click(await screen.findByRole('option', { name: option }))
}

async function showStatus(user: UserEvent, label: string) {
  await user.click(screen.getByRole('radio', { name: label }))
}

async function openNewDelivery(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: 'Nova entrega' }))
  return screen.findByRole('dialog', { name: 'Nova entrega' })
}

describe('DeliveriesPage', () => {
  describe('list', () => {
    it('opens showing only the deliveries waiting for pick up', async () => {
      renderWithProviders(<DeliveriesPage />)

      const rows = await tableRows()
      expect(rows).toHaveLength(2)
      expect(screen.getByRole('radio', { name: 'Aguardando retirada' })).toBeChecked()
      expect(api.requests.at(-1)?.url.searchParams.get('status')).toBe('pending')
    })

    it('shows every delivery with resident, apartment, package and status', async () => {
      const { user } = renderWithProviders(<DeliveriesPage />)
      await tableRows()
      await showStatus(user, 'Todas')

      await waitFor(async () => expect(await tableRows()).toHaveLength(3))
      expect(api.requests.at(-1)?.url.searchParams.has('status')).toBe(false)

      const ana = await rowOf('Ana Souza')
      expect(within(ana).getByText('101')).toBeInTheDocument()
      expect(within(ana).getByText('Caixa')).toBeInTheDocument()
      expect(within(ana).getByText('Aguardando retirada')).toBeInTheDocument()

      const other = await rowOf('Outro')
      expect(within(other).getByText('Retirada')).toBeInTheDocument()
    })

    it('shows an empty state when there are no deliveries', async () => {
      api.deliveries = []
      renderWithProviders(<DeliveriesPage />)

      expect(await screen.findByText('Nenhuma entrega encontrada.')).toBeInTheDocument()
    })

    it('shows the API error when the list fails', async () => {
      server.use(http.get(`${apiUrl}/v1/deliveries`, () => HttpResponse.json({ error: 'internal server error' }, { status: 500 })))
      renderWithProviders(<DeliveriesPage />)

      expect(await screen.findByText('Não foi possível carregar as entregas')).toBeInTheDocument()
      expect(screen.getByText('internal server error')).toBeInTheDocument()
    })
  })

  describe('status filter', () => {
    it('lists only the picked up deliveries', async () => {
      const { user } = renderWithProviders(<DeliveriesPage />)
      await tableRows()

      await showStatus(user, 'Retiradas')

      await waitFor(async () => expect(await tableRows()).toHaveLength(1))
      expect(within(await rowOf('Outro')).getByText('Retirada')).toBeInTheDocument()
      expect(api.requests.at(-1)?.url.searchParams.get('status')).toBe('deleted')
    })
  })

  describe('apartment filter', () => {
    it('lists only the deliveries of the selected apartment', async () => {
      const { user } = renderWithProviders(<DeliveriesPage />)
      await tableRows()

      await selectOption(user, screen.getByRole('textbox', { name: 'Apartamento' }), '202')

      await waitFor(async () => expect(await tableRows()).toHaveLength(1))
      expect(await rowOf('Bruno Lima')).toBeInTheDocument()
      expect(api.requests.at(-1)?.url.searchParams.get('apartment')).toBe('202')
    })
  })

  describe('new delivery', () => {
    it('registers a delivery for the selected resident', async () => {
      const { user } = renderWithProviders(<DeliveriesPage />)
      await tableRows()
      const dialog = await openNewDelivery(user)

      await selectOption(user, within(dialog).getByRole('textbox', { name: 'Apartamento' }), '101')
      await selectOption(user, within(dialog).getByRole('textbox', { name: 'Morador' }), 'Ana Souza')
      await selectOption(user, within(dialog).getByRole('textbox', { name: 'Tipo do pacote' }), 'Envelope')
      await selectOption(user, within(dialog).getByRole('textbox', { name: 'Urgência' }), 'Normal')
      await user.click(within(dialog).getByRole('button', { name: 'Registrar entrega' }))

      expect(await screen.findByText('Entrega registrada. O morador será avisado pelo WhatsApp.')).toBeInTheDocument()
      expect(api.requests.find((r) => r.method === 'POST')?.body).toEqual({
        apartment: '101',
        resident_id: 'ana',
        package_type: 'envelope',
        urgency: 'normal',
      })
      await waitFor(async () => expect(await tableRows()).toHaveLength(3))
      expect(screen.queryByRole('dialog', { name: 'Nova entrega' })).not.toBeInTheDocument()
    })

    it('enables the resident only after choosing the apartment and offers the "Outro"', async () => {
      const { user } = renderWithProviders(<DeliveriesPage />)
      const dialog = await openNewDelivery(user)
      const resident = within(dialog).getByRole('textbox', { name: 'Morador' })
      expect(resident).toBeDisabled()

      await selectOption(user, within(dialog).getByRole('textbox', { name: 'Apartamento' }), '101')
      await waitFor(() => expect(resident).toBeEnabled())
      await user.click(resident)

      const options = await screen.findAllByRole('option')
      expect(options.map((o) => o.textContent)).toEqual(['Ana Souza', 'Outro (avisa o morador principal)'])
    })

    it('requires every field and sends nothing while the form is invalid', async () => {
      const { user } = renderWithProviders(<DeliveriesPage />)
      const dialog = await openNewDelivery(user)

      await user.click(within(dialog).getByRole('button', { name: 'Registrar entrega' }))

      expect(within(dialog).getByText('Selecione o apartamento')).toBeInTheDocument()
      expect(within(dialog).getByText('Selecione o morador')).toBeInTheDocument()
      expect(within(dialog).getByText('Selecione o tipo do pacote')).toBeInTheDocument()
      expect(within(dialog).getByText('Selecione a urgência')).toBeInTheDocument()
      expect(api.requests.some((r) => r.method === 'POST')).toBe(false)
    })

    it('keeps the form open and shows the API error when the registration fails', async () => {
      server.use(
        http.post(`${apiUrl}/v1/deliveries`, () =>
          HttpResponse.json({ error: 'não existe um morador cadastrado para este apartamento' }, { status: 422 }),
        ),
      )
      const { user } = renderWithProviders(<DeliveriesPage />)
      const dialog = await openNewDelivery(user)

      await selectOption(user, within(dialog).getByRole('textbox', { name: 'Apartamento' }), '101')
      await selectOption(user, within(dialog).getByRole('textbox', { name: 'Morador' }), 'Ana Souza')
      await selectOption(user, within(dialog).getByRole('textbox', { name: 'Tipo do pacote' }), 'Caixa')
      await selectOption(user, within(dialog).getByRole('textbox', { name: 'Urgência' }), 'Alta')
      await user.click(within(dialog).getByRole('button', { name: 'Registrar entrega' }))

      expect(await screen.findByText('não existe um morador cadastrado para este apartamento')).toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: 'Nova entrega' })).toBeInTheDocument()
    })
  })

  describe('pick up', () => {
    it('marks the delivery as picked up after the confirmation', async () => {
      const { user } = renderWithProviders(<DeliveriesPage />)
      const ana = await rowOf('Ana Souza')

      await user.click(within(ana).getByRole('button', { name: 'Ações' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Marcar como retirada' }))
      const confirm = await screen.findByRole('dialog', { name: 'Confirmar retirada' })
      expect(within(confirm).getByText(/apartamento/)).toHaveTextContent('Confirma que a entrega do apartamento 101 para Ana Souza foi retirada?')
      await user.click(within(confirm).getByRole('button', { name: 'Confirmar retirada' }))

      expect(await screen.findByText('Entrega marcada como retirada.')).toBeInTheDocument()
      expect(api.requests.find((r) => r.method === 'DELETE')?.url.pathname).toBe('/v1/deliveries/d1')
      await waitFor(async () => expect(await tableRows()).toHaveLength(1))
      expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument()
    })

    it('does nothing when the confirmation is cancelled', async () => {
      const { user } = renderWithProviders(<DeliveriesPage />)
      const ana = await rowOf('Ana Souza')

      await user.click(within(ana).getByRole('button', { name: 'Ações' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Marcar como retirada' }))
      await user.click(within(await screen.findByRole('dialog', { name: 'Confirmar retirada' })).getByRole('button', { name: 'Cancelar' }))

      await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Confirmar retirada' })).not.toBeInTheDocument())
      expect(api.requests.some((r) => r.method === 'DELETE')).toBe(false)
    })

    it('shows the API error when the pick up fails', async () => {
      server.use(http.delete(`${apiUrl}/v1/deliveries/:deliveryId`, () => HttpResponse.json({ error: 'delivery not found' }, { status: 404 })))
      const { user } = renderWithProviders(<DeliveriesPage />)

      await user.click(within(await rowOf('Ana Souza')).getByRole('button', { name: 'Ações' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Marcar como retirada' }))
      await user.click(within(await screen.findByRole('dialog', { name: 'Confirmar retirada' })).getByRole('button', { name: 'Confirmar retirada' }))

      expect(await screen.findByText('Não foi possível retirar')).toBeInTheDocument()
      expect(screen.getByText('delivery not found')).toBeInTheDocument()
    })

    it('disables the action for a delivery already picked up', async () => {
      const { user } = renderWithProviders(<DeliveriesPage />)
      await tableRows()
      await showStatus(user, 'Retiradas')

      await user.click(within(await rowOf('Outro')).getByRole('button', { name: 'Ações' }))

      expect(await screen.findByRole('menuitem', { name: 'Marcar como retirada' })).toBeDisabled()
    })
  })
})
