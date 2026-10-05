import { queryString, request } from './client'
import type { Delivery, DeliveryFilter, NewDelivery, Resident } from './types'

export const entregadorApi = {
  listDeliveries: (filter: DeliveryFilter) =>
    request<Delivery[]>(`/v1/deliveries${queryString({ apartment: filter.apartment, status: filter.status })}`),

  createDelivery: (delivery: NewDelivery) =>
    request<Delivery>('/v1/deliveries', { method: 'POST', body: JSON.stringify(delivery) }),

  pickUpDelivery: (deliveryId: string) =>
    request<void>(`/v1/deliveries/${encodeURIComponent(deliveryId)}`, { method: 'DELETE' }),

  listApartments: () => request<string[]>('/v1/apartments'),

  listResidents: (apartment: string) =>
    request<Resident[]>(`/v1/residents${queryString({ apartment })}`),
}
