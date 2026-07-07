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
  roomIds: string[]   // supports multiple room selection
  checkIn: string
  checkOut: string
}

/* ── Prefill hints supplied by the AI ─────────── */
export interface BookingPrefill {
  checkIn?: string
  checkOut?: string
}

/* ── Individual booking returned from API ──────── */
export interface BookingRecord {
  id: string
  guestName: string
  phone: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  status: string
}

/* ── Result returned by the /api/bookings route ── */
export interface BookingResult {
  success: boolean
  bookings?: BookingRecord[]
  /** Primary booking id (first room) kept for backward compat */
  booking?: { id: string }
  error?: string
  retry?: boolean
}
