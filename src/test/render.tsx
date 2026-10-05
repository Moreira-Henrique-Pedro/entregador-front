import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'

export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })

  return {
    user: userEvent.setup(),
    ...render(
      <MantineProvider env="test">
        <QueryClientProvider client={queryClient}>
          <ModalsProvider>
            <Notifications />
            {ui}
          </ModalsProvider>
        </QueryClientProvider>
      </MantineProvider>,
    ),
  }
}
