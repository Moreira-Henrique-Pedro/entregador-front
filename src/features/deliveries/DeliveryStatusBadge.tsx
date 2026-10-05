import { Badge } from '@mantine/core'
import type { DeliveryStatus } from '../../api/types'
import { statusColors, statusLabels } from './labels'

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <Badge color={statusColors[status]} variant="light">
      {statusLabels[status]}
    </Badge>
  )
}
