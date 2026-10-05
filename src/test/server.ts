import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import type { Delivery, NewDelivery, Resident } from '../api/types'
import { ana, bruno, delivery, other101 } from './fixtures'

export const apiUrl = 'http://api.test'

export const api = {
  residents: [] as Resident[],
  deliveries: [] as Delivery[],
  requests: [] as { method: string; url: URL; body?: unknown }[],
}

export function resetApiData() {
  api.residents = [ana, other101, bruno]
  api.deliveries = [
    delivery({ delivery_id: 'd1', apartment: '101', resident_id: 'ana', resident_name: 'Ana Souza' }),
    delivery({ delivery_id: 'd2', apartment: '202', resident_id: 'bruno', resident_name: 'Bruno Lima', package_type: 'envelope' }),
    delivery({ delivery_id: 'd3', apartment: '101', resident_id: 'other-101', resident_name: 'Outro', status: 'deleted', deleted_at: '2026-10-04T13:00:00Z' }),
  ]
  api.requests = []
}

export const server = setupServer(
  http.get(`${apiUrl}/v1/deliveries`, ({ request }) => {
    const url = new URL(request.url)
    api.requests.push({ method: 'GET', url })
    const apartment = url.searchParams.get('apartment')
    const status = url.searchParams.get('status')
    return HttpResponse.json(
      api.deliveries.filter((d) => (!apartment || d.apartment === apartment) && (!status || d.status === status)),
    )
  }),

  http.post(`${apiUrl}/v1/deliveries`, async ({ request }) => {
    const body = (await request.json()) as NewDelivery
    api.requests.push({ method: 'POST', url: new URL(request.url), body })
    const resident = api.residents.find((r) => r.resident_id === body.resident_id)
    const created = delivery({
      delivery_id: `d${api.deliveries.length + 1}`,
      apartment: body.apartment,
      resident_id: body.resident_id ?? '',
      resident_name: resident?.name,
      package_type: body.package_type ?? '',
      urgency: body.urgency ?? '',
      created_at: '2026-10-05T09:00:00Z',
    })
    api.deliveries = [created, ...api.deliveries]
    return HttpResponse.json(created, { status: 201 })
  }),

  http.delete(`${apiUrl}/v1/deliveries/:deliveryId`, ({ params, request }) => {
    api.requests.push({ method: 'DELETE', url: new URL(request.url) })
    const found = api.deliveries.find((d) => d.delivery_id === params.deliveryId)
    if (!found) {
      return HttpResponse.json({ error: 'delivery not found' }, { status: 404 })
    }
    found.status = 'deleted'
    found.deleted_at = '2026-10-05T10:00:00Z'
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${apiUrl}/v1/apartments`, () =>
    HttpResponse.json([...new Set(api.residents.filter((r) => r.type !== 'other').map((r) => r.apartment))]),
  ),

  http.get(`${apiUrl}/v1/residents`, ({ request }) => {
    const apartment = new URL(request.url).searchParams.get('apartment')
    return HttpResponse.json(api.residents.filter((r) => r.apartment === apartment))
  }),
)
