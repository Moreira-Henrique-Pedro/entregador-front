import type { Delivery, Resident } from '../api/types'

export const ana: Resident = {
  resident_id: 'ana',
  name: 'Ana Souza',
  apartment: '101',
  phone: '11999998888',
  type: 'resident-primary',
  status: 'created',
  created_at: '2026-10-01T10:00:00Z',
  updated_at: '2026-10-01T10:00:00Z',
}

export const other101: Resident = {
  resident_id: 'other-101',
  name: 'Outro',
  apartment: '101',
  phone: '',
  type: 'other',
  status: 'created',
  created_at: '2026-10-01T10:00:00Z',
  updated_at: '2026-10-01T10:00:00Z',
}

export const bruno: Resident = {
  resident_id: 'bruno',
  name: 'Bruno Lima',
  apartment: '202',
  phone: '11988887777',
  type: 'resident-primary',
  status: 'created',
  created_at: '2026-10-01T10:00:00Z',
  updated_at: '2026-10-01T10:00:00Z',
}

export function delivery(overrides: Partial<Delivery>): Delivery {
  return {
    delivery_id: 'd1',
    apartment: '101',
    resident_id: 'ana',
    resident_name: 'Ana Souza',
    package_type: 'caixa',
    urgency: 'alta',
    status: 'pending',
    created_at: '2026-10-04T12:00:00Z',
    updated_at: '2026-10-04T12:00:00Z',
    ...overrides,
  }
}
