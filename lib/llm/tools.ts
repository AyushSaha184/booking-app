import { tool } from 'ai'
import { z } from 'zod'
import { getAvailableRooms } from '../db/rooms'
import { lookupBooking, cancelBooking } from '../db/bookings'
import { syncBookingToSheet, updateBookingStatusInSheet } from '../sheets/sync'
import { validateRequestSize } from '../validation'
import { logger } from '../logger'

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
    inputSchema: CheckRoomsParams,
    execute: async (args: z.infer<typeof CheckRoomsParams>) => {
      logger.info('Executing LLM tool: checkRooms', { checkIn: args.checkIn, checkOut: args.checkOut })
      if (!validateRequestSize(JSON.stringify(args), 1000)) {
        logger.warn('checkRooms payload size invalid')
        return { available: false, availableRooms: [], error: 'Invalid request size' }
      }

      const { checkIn, checkOut } = args
      const available = await getAvailableRooms(checkIn, checkOut)
      logger.info('checkRooms executed', { availableCount: available.length })
      if (available.length === 0) {
        return { available: false, availableRooms: [] }
      }
      return { available: true, availableRooms: JSON.parse(JSON.stringify(available)) }
    },
  }),

  showBookingForm: tool({
    description: 'Show the booking form UI to the user. Call this after checkRooms returns available rooms and the user wants to proceed with booking.',
    inputSchema: ShowBookingFormParams,
    execute: async (args: unknown) => {
      logger.info('Executing LLM tool: showBookingForm')
      if (!validateRequestSize(JSON.stringify(args), 10000)) {
        return { shown: false, error: 'Invalid request size' }
      }

      try {
        ShowBookingFormParams.parse(args)
      } catch {
        const anyArgs = args as any
        if (anyArgs?.rooms && !anyArgs?.availableRooms) {
          ShowBookingFormParams.parse({ ...anyArgs, availableRooms: anyArgs.rooms })
        } else {
          logger.warn('showBookingForm invalid params')
          return { shown: false, error: 'Invalid parameters' }
        }
      }

      return { shown: true }
    },
  }),

  lookupBooking: tool({
    description: 'Look up a booking by guest name and phone number. Call this when user wants to cancel or check their booking.',
    inputSchema: LookupBookingParams,
    execute: async (args: z.infer<typeof LookupBookingParams>) => {
      logger.info('Executing LLM tool: lookupBooking', { guestName: args.guestName })
      if (!validateRequestSize(JSON.stringify(args), 500)) {
        return { found: false, message: 'Invalid request' }
      }

      const { guestName, phone } = args
      const booking = await lookupBooking(guestName, phone)
      if (!booking) {
        logger.info('lookupBooking result: not found')
        return { found: false, message: 'No active booking found with those details.' }
      }
      logger.info('lookupBooking result: found', { bookingId: booking.id })
      return { found: true, booking: JSON.parse(JSON.stringify(booking)) }
    },
  }),

  cancelBooking: tool({
    description: 'Cancel a confirmed booking. ALWAYS ask the user for confirmation before calling this tool.',
    inputSchema: CancelBookingParams,
    execute: async (args: z.infer<typeof CancelBookingParams>) => {
      logger.info('Executing LLM tool: cancelBooking', { bookingId: args.bookingId })
      if (!validateRequestSize(JSON.stringify(args), 500)) {
        return { success: false, error: 'Invalid request' }
      }

      const { bookingId, guestName, phone } = args
      const updated = await cancelBooking(bookingId, guestName, phone)

      if (!updated) {
        logger.warn('cancelBooking failed: booking not found or verification failed', { bookingId })
        return { success: false, error: 'Booking not found or verification failed' }
      }

      logger.info('cancelBooking succeeded', { bookingId: updated.id })
      updateBookingStatusInSheet(bookingId, 'cancelled').catch((err) => {
        logger.error('Sheet status update failed on cancellation', { bookingId, error: err instanceof Error ? err.message : String(err) })
      })
      return { success: true, bookingId: updated.id }
    },
  }),
}
