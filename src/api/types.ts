import type { components, operations } from './schema'

type Schemas = components['schemas']

export type Delivery = Schemas['Delivery']
export type DeliveryStatus = Schemas['DeliveryStatus']
export type NewDelivery = Schemas['RegisterDeliveryRequest']
export type DeliveryFilter = NonNullable<operations['listDeliveries']['parameters']['query']>

export type Resident = Schemas['Resident']
export type ResidentType = Schemas['ResidentType']
