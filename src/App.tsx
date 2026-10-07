import { AppShell, Button, Center, Container, Group, Loader, Stack, Text, Title } from '@mantine/core'
import { IconLogout, IconPackage } from '@tabler/icons-react'
import { isStaff } from './auth/authClient'
import { useAuth } from './auth/useAuth'
import { LoginPage } from './auth/LoginPage'
import { ColorSchemeToggle } from './components/ColorSchemeToggle'
import { DeliveriesPage } from './features/deliveries/DeliveriesPage'

export function App() {
  const { session, signOut } = useAuth()

  if (session.status === 'loading') {
    return (
      <Center mih="100vh">
        <Loader aria-label="Carregando" />
      </Center>
    )
  }
  if (session.status === 'signedOut') {
    return <LoginPage />
  }

  const { user } = session

  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap">
              <IconPackage />
              <Title order={4}>Entregador</Title>
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Text size="sm" c="dimmed" visibleFrom="sm">
                {user.name || user.email}
              </Text>
              <ColorSchemeToggle />
              <Button variant="default" leftSection={<IconLogout size={16} />} onClick={() => void signOut()}>
                Sair
              </Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg" px={0}>
          {isStaff(user) ? (
            <DeliveriesPage />
          ) : (
            <Stack align="center" mt="xl">
              <Title order={4}>Sem permissão</Title>
              <Text c="dimmed" ta="center">
                Seu usuário não tem acesso às entregas. Fale com o síndico.
              </Text>
            </Stack>
          )}
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
