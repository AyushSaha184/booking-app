import { tool, zodSchema } from 'ai'
import { z } from 'zod'
import { getAvailableRooms } from '../db/rooms'
import { lookupBooking, cancelBooking } from '../db/bookings'
import { syncBookingToSheet, updateBookingStatusInSheet } from '../sheets/sync'
import { CheckRoomsSchema, validateRequestSize } from '../validation'

const CheckRoomsParams = z.object({
  checkIn: z.string(),
  checkOut: z.string(),
})

const ShowBookingFormParams = z.object({
  availableRooms: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    capacity: z.number(),
    pricePerNight: z.number(),
  })),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.number().optional(),
})

const LookupBookingParams = z.object({
  guestName: z.string(),
  phone: z.string(),
})

const CancelBookingParams = z.object({
  bookingId: z.string(),
  guestName: z.string(),
  phone: z.string(),
})

export const tools = {
  checkRooms: tool({
    description: 'Check available rooms for given dates. Call this when the user asks about availability or wants to book.',
    inputSchema: zodSchema(CheckRoomsSchema),
    execute: async (args: unknown) => {
      if (!validateRequestSize(JSON.stringify(args), 1000)) {
        return { available: false, rooms: [], error: 'Invalid request size' }
      }

      let validated: z.infer<typeof CheckRoomsParams>
      try {
        validated = CheckRoomsParams.parse(args)
      } catch {
        return { available: false, rooms: [], error: 'Invalid parameters' }
      }

      const { checkIn, checkOut } = validated
      const available = await getAvailableRooms(checkIn, checkOut)
      if (available.length === 0) {
        return { available: false, rooms: [] }
      }
      return { available: true, rooms: JSON.parse(JSON.stringify(available)) }
    },
  }),

  showBookingForm: tool({
    description: 'Show the booking form UI to the user. Call this after checkRooms returns available rooms and the user wants to proceed with booking.',
    inputSchema: zodSchema(ShowBookingFormParams),
    execute: async (args: unknown) => {
      if (!validateRequestSize(JSON.stringify(args), 10000)) {
        return { shown: false, error: 'Invalid request size' }
      }

      try {
        ShowBookingFormParams.parse(args)
      } catch {
        return { shown: false, error: 'Invalid parameters' }
      }

      return { shown: true }
    },
  }),

  lookupBooking: tool({
    description: 'Look up a booking by guest name and phone number. Call this when user wants to cancel or check their booking.',
    inputSchema: zodSchema(LookupBookingParams),
    execute: async (args: unknown) => {
      if (!validateRequestSize(JSON.stringify(args), 500)) {
        return { found: false, message: 'Invalid request' }
      }

      let validated: z.infer<typeof LookupBookingParams>
      try {
        validated = LookupBookingParams.parse(args)
      } catch {
        return { found: false, message: 'Invalid input' }
      }

      const { guestName, phone } = validated
      const booking = await lookupBooking(guestName, phone)
      if (!booking) {
        return { found: false, message: 'No active booking found with those details.' }
      }
      return { found: true, booking: JSON.parse(JSON.stringify(booking)) }
    },
  }),

  cancelBooking: tool({
    description: 'Cancel a confirmed booking. ALWAYS ask the user for confirmation before calling this tool.',
    inputSchema: zodSchema(CancelBookingParams),
    execute: async (args: unknown) => {
      if (!validateRequestSize(JSON.stringify(args), 500)) {
        return { success: false, error: 'Invalid request' }
      }

      let validated: z.infer<typeof CancelBookingParams>
      try {
        validated = CancelBookingParams.parse(args)
      } catch {
        return { success: false, error: 'Invalid cancellation data' }
      }

      const { bookingId, guestName, phone } = validated
      const updated = await cancelBooking(bookingId, guestName, phone)

      if (!updated) {
        return { success: false, error: 'Booking not found or verification failed' }
      }

      updateBookingStatusInSheet(bookingId, 'cancelled').catch(console.error)
      return { success: true, bookingId: updated.id }
    },
  }),
}