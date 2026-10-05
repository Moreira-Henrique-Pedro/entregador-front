import { AppShell, Container, Group, Title } from '@mantine/core'
import { IconPackage } from '@tabler/icons-react'
import { DeliveriesPage } from './features/deliveries/DeliveriesPage'

export function App() {
  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" gap="xs">
            <IconPackage />
            <Title order={4}>Entregador</Title>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg" px={0}>
          <DeliveriesPage />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
