/* ── Room ──────────────────────────────────────── */
export interface Room {
  id: string
  name: string
  type: string
  capacity: number
  pricePerNight: number
  description?: string | null
  images?: string[] | null
}

/* ── User ──────────────────────────────────────── */
export interface User {
  id: string
  name: string
  phone: string
  email?: string | null
  createdAt?: string | null
}

/* ── Form data collected by BookingFormCard ───── */
export interface BookingFormData {
  guestName: string
  phone: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
}

/* ── Prefill hints supplied by the AI ─────────── */
export interface BookingPrefill {
  checkIn?: string
  checkOut?: string
  guests?: number
}

/* ── Result returned by the /api/bookings route ── */
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
