export type DeliveryStatus = 'pending' | 'deleted'

export interface Delivery {
  delivery_id: string
  apartment: string
  resident_id: string
  resident_name?: string
  package_type: string
  urgency: string
  status: DeliveryStatus
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface NewDelivery {
  apartment: string
  resident_id: string
  package_type: string
  urgency: string
}

export interface DeliveryFilter {
  apartment?: string
}

export type ResidentType = 'resident-primary' | 'resident-secondary' | 'other'

export interface Resident {
  resident_id: string
  name: string
  apartment: string
  phone: string
  type: ResidentType
  status: string
}
