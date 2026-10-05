import type { DeliveryStatus, Resident } from '../../api/types'

export const statusLabels: Record<DeliveryStatus, string> = {
  pending: 'Aguardando retirada',
  deleted: 'Retirada',
}

export const statusColors: Record<DeliveryStatus, string> = {
  pending: 'yellow',
  deleted: 'green',
}

export const packageTypeOptions = [
  { value: 'caixa', label: 'Caixa' },
  { value: 'envelope', label: 'Envelope' },
  { value: 'sacola', label: 'Sacola' },
  { value: 'pacote', label: 'Pacote' },
  { value: 'outro', label: 'Outro' },
]

export const urgencyOptions = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
]

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value))
}

export function labelOf(options: { value: string; label: string }[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value
}

export function residentOptions(residents: Resident[]) {
  const others = residents.filter((resident) => resident.type === 'other')
  const people = residents
    .filter((resident) => resident.type !== 'other')
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  return [
    ...people.map((resident) => ({ value: resident.resident_id, label: resident.name })),
    ...others.map((resident) => ({ value: resident.resident_id, label: 'Outro (avisa o morador principal)' })),
  ]
}
