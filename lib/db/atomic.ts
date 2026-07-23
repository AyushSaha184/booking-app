import { db } from './client'
import { bookings, bookingRooms } from './schema'
import { and, eq, ne, sql, lt, gt } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { logger } from '../logger'

/**
 * Atomically create a single booking with multiple linked rooms in a single serializable transaction.
 * All selected rooms are checked for date conflicts before any insert.
 * If any room is unavailable, the entire transaction is rolled back.
 */
export async function atomicCreateMultipleBookings(data: {
  guestName: string
  phone: string
  roomIds: string[]
  checkIn: string
  checkOut: string
}): Promise<
  | { success: true; booking: any; bookings: any[] }
  | { success: false; error: string; retry: boolean; conflictRoomId?: string }
> {
  const maxRetries = 3
  const uniqueRoomIds = [...new Set(data.roomIds)]

  if (uniqueRoomIds.length === 0) {
    return { success: false, error: 'Please select at least one room', retry: false }
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      logger.debug('Starting multi-room atomic transaction', { attempt, roomIds: uniqueRoomIds })

      const createdBooking = await db().transaction(
        async (tx) => {
          // ── 1. Check ALL rooms for date conflicts through booking_rooms -> bookings ──
          for (const roomId of uniqueRoomIds) {
            const overlapping = await tx
              .select({ count: sql<number>`count(*)::int` })
              .from(bookingRooms)
              .innerJoin(bookings, eq(bookingRooms.bookingId, bookings.id))
              .where(
                and(
                  eq(bookingRooms.roomId, roomId),
                  ne(bookings.status, 'cancelled'),
                  lt(bookings.checkIn, data.checkOut),
                  gt(bookings.checkOut, data.checkIn)
                )
              )

            const overlapCount = Number(overlapping[0]?.count ?? 0)
            if (overlapCount > 0) {
              const err: any = new Error(`Room ${roomId} is no longer available for selected dates`)
              err.conflictRoomId = roomId
              throw err
            }
          }

          // ── 2. Insert ONE booking header ──────────────────────────────
          const id = 'BK-' + nanoid(6).toUpperCase()
          const [header] = await tx
            .insert(bookings)
            .values({
              id,
              guestName: data.guestName,
              phone: data.phone,
              checkIn: data.checkIn,
              checkOut: data.checkOut,
              guests: uniqueRoomIds.length,
              status: 'pending',
            })
            .returning()

          // ── 3. Bulk insert linked rooms into booking_rooms ────────────
          for (const roomId of uniqueRoomIds) {
            await tx.insert(bookingRooms).values({
              bookingId: id,
              roomId,
            })
          }

          return {
            ...header,
            roomIds: uniqueRoomIds,
          }
        },
        { isolationLevel: 'serializable' }
      )

      return {
        success: true,
        booking: createdBooking,
        bookings: [createdBooking],
      }
    } catch (err: any) {
      const errorMessage = (err?.message ?? err?.toString() ?? '').toLowerCase()
      const errorCode = err?.code ?? ''

      // Serialization / deadlock -> retry
      if (
        errorCode === '40001' ||
        errorMessage.includes('serialization') ||
        errorMessage.includes('could not serialize') ||
        errorMessage.includes('deadlock')
      ) {
        logger.warn('Multi-room atomic transaction concurrency collision', { attempt, errorCode })
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)))
          continue
        }
        return { success: false, error: 'Booking failed due to concurrent request. Please try again.', retry: true }
      }

      // Room unavailability
      if (errorMessage.includes('no longer available')) {
        logger.info('Multi-room atomic check: room unavailable', { conflictRoomId: err?.conflictRoomId })
        return {
          success: false,
          error: err?.message ?? 'One or more selected rooms are no longer available for selected dates',
          retry: false,
          conflictRoomId: err?.conflictRoomId,
        }
      }

      // Unique constraint
      if (
        errorMessage.includes('duplicate') ||
        errorMessage.includes('unique') ||
        errorCode === '23505'
      ) {
        return { success: false, error: 'One or more rooms are no longer available for selected dates', retry: false }
      }

      throw err
    }
  }

  return { success: false, error: 'Booking failed. Please try again.', retry: true }
}