import { Alert, Button, Center, Group, Loader, Select, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconAlertCircle, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { DeliveriesList } from './DeliveriesList'
import { NewDeliveryModal } from './NewDeliveryModal'
import { useApartments, useDeliveries } from './queries'

export function DeliveriesPage() {
  const [apartment, setApartment] = useState<string | null>(null)
  const [newDeliveryOpened, newDelivery] = useDisclosure(false)
  const apartments = useApartments()
  const deliveries = useDeliveries({ apartment: apartment ?? undefined })

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Entregas</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={newDelivery.open}>
          Nova entrega
        </Button>
      </Group>

      <Select
        label="Apartamento"
        placeholder="Todos"
        data={apartments.data ?? []}
        value={apartment}
        onChange={setApartment}
        searchable
        clearable
        maw={{ sm: 240 }}
      />

      <DeliveriesContent state={deliveries} />

      <NewDeliveryModal opened={newDeliveryOpened} onClose={newDelivery.close} />
    </Stack>
  )
}

function DeliveriesContent({ state }: { state: ReturnType<typeof useDeliveries> }) {
  if (state.isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  }
  if (state.isError) {
    return (
      <Alert color="red" icon={<IconAlertCircle />} title="Não foi possível carregar as entregas">
        {state.error.message}
      </Alert>
    )
  }
  if (!state.data?.length) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        Nenhuma entrega encontrada.
      </Text>
    )
  }
  return <DeliveriesList deliveries={state.data} />
}
