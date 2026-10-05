import { ActionIcon, Menu, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconDots, IconPackageExport } from '@tabler/icons-react'
import type { Delivery } from '../../api/types'
import { usePickUpDelivery } from './queries'

export function DeliveryActions({ delivery }: { delivery: Delivery }) {
  const pickUp = usePickUpDelivery()

  const confirmPickUp = () =>
    modals.openConfirmModal({
      title: 'Confirmar retirada',
      centered: true,
      children: (
        <Text size="sm">
          Confirma que a entrega do apartamento <b>{delivery.apartment}</b>
          {delivery.resident_name ? ` para ${delivery.resident_name}` : ''} foi retirada? O morador será avisado.
        </Text>
      ),
      labels: { confirm: 'Confirmar retirada', cancel: 'Cancelar' },
      onConfirm: () =>
        pickUp.mutate(delivery.delivery_id, {
          onSuccess: () => notifications.show({ color: 'green', message: 'Entrega marcada como retirada.' }),
          onError: (error) => notifications.show({ color: 'red', title: 'Não foi possível retirar', message: error.message }),
        }),
    })

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" aria-label="Ações" loading={pickUp.isPending}>
          <IconDots size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconPackageExport size={16} />}
          disabled={delivery.status !== 'pending'}
          onClick={confirmPickUp}
        >
          Marcar como retirada
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
