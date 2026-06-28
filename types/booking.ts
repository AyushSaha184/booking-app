/** A resort room returned from the database / AI tool */
export interface Room {
  id: string
  name: string
  type: string
  capacity: number
  pricePerNight: number
}

/** Form data collected by BookingFormCard */
export interface BookingFormData {
  guestName: string
  phone: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
}

/** Prefill hints supplied by the AI */
export interface BookingPrefill {
  checkIn?: string
  checkOut?: string
  guests?: number
}

/** Result returned by the /api/bookings route */
export interface BookingResult {
  success: boolean
  booking?: {
    id: string
    guestName: string
    phone: string
    roomId: string
    checkIn: string
    checkOut: string
    guests: number
    status: string
  }
  error?: string
  retry?: boolean
}
