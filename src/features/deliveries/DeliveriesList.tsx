import { Card, Group, Stack, Table, Text } from '@mantine/core'
import type { Delivery } from '../../api/types'
import { DeliveryActions } from './DeliveryActions'
import { DeliveryStatusBadge } from './DeliveryStatusBadge'
import { formatDate, labelOf, packageTypeOptions } from './labels'

const noName = '—'

export function DeliveriesList({ deliveries }: { deliveries: Delivery[] }) {
  return (
    <>
      <DeliveriesTable deliveries={deliveries} />
      <DeliveriesCards deliveries={deliveries} />
    </>
  )
}

function DeliveriesTable({ deliveries }: { deliveries: Delivery[] }) {
  return (
    <Table visibleFrom="sm" striped highlightOnHover verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Morador</Table.Th>
          <Table.Th>Apartamento</Table.Th>
          <Table.Th>Pacote</Table.Th>
          <Table.Th>Recebida em</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th w={60} />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {deliveries.map((delivery) => (
          <Table.Tr key={delivery.delivery_id}>
            <Table.Td>{delivery.resident_name || noName}</Table.Td>
            <Table.Td>{delivery.apartment}</Table.Td>
            <Table.Td>{labelOf(packageTypeOptions, delivery.package_type) || noName}</Table.Td>
            <Table.Td>{formatDate(delivery.created_at)}</Table.Td>
            <Table.Td>
              <DeliveryStatusBadge status={delivery.status} />
            </Table.Td>
            <Table.Td>
              <DeliveryActions delivery={delivery} />
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

function DeliveriesCards({ deliveries }: { deliveries: Delivery[] }) {
  return (
    <Stack hiddenFrom="sm" gap="sm">
      {deliveries.map((delivery) => (
        <Card key={delivery.delivery_id} withBorder padding="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={4}>
              <Text fw={600}>{delivery.resident_name || noName}</Text>
              <Text size="sm" c="dimmed">
                Apto {delivery.apartment} · {labelOf(packageTypeOptions, delivery.package_type) || noName}
              </Text>
              <Text size="xs" c="dimmed">
                {formatDate(delivery.created_at)}
              </Text>
              <DeliveryStatusBadge status={delivery.status} />
            </Stack>
            <DeliveryActions delivery={delivery} />
          </Group>
        </Card>
      ))}
    </Stack>
  )
}
