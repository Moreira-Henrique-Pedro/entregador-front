import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { entregadorApi } from '../../api/entregador'
import type { DeliveryFilter, NewDelivery } from '../../api/types'

const deliveriesKey = ['deliveries'] as const
const apartmentsKey = ['apartments'] as const

export function useDeliveries(filter: DeliveryFilter) {
  return useQuery({
    queryKey: [...deliveriesKey, filter],
    queryFn: () => entregadorApi.listDeliveries(filter),
  })
}

export function useApartments() {
  return useQuery({
    queryKey: apartmentsKey,
    queryFn: entregadorApi.listApartments,
  })
}

export function useResidents(apartment: string) {
  return useQuery({
    queryKey: ['residents', apartment],
    queryFn: () => entregadorApi.listResidents(apartment),
    enabled: apartment !== '',
  })
}

export function useCreateDelivery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (delivery: NewDelivery) => entregadorApi.createDelivery(delivery),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deliveriesKey }),
  })
}

export function usePickUpDelivery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (deliveryId: string) => entregadorApi.pickUpDelivery(deliveryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deliveriesKey }),
  })
}
