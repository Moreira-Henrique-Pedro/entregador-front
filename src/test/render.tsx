import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import type { AuthClient } from '../auth/authClient'
import { AuthProvider } from '../auth/AuthProvider'

export function renderWithProviders(ui: ReactElement, { auth }: { auth?: AuthClient } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })

  return {
    user: userEvent.setup(),
    ...render(
      <MantineProvider env="test">
        <QueryClientProvider client={queryClient}>
          <ModalsProvider>
            <Notifications />
            {auth ? <AuthProvider client={auth}>{ui}</AuthProvider> : ui}
          </ModalsProvider>
        </QueryClientProvider>
      </MantineProvider>,
    ),
  }
}
