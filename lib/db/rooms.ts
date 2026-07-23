import { db } from './client'
import { bookings, bookingRooms, rooms } from './schema'
import { and, eq, ne, lt, gt, gte, or, not, inArray } from 'drizzle-orm'
import { logger } from '../logger'

export async function getAvailableRooms(checkIn: string, checkOut: string) {
  // Auto-cancel any pending bookings older than 45 minutes
  const { autoCancelExpiredPendingBookings } = require('./bookings')
  await autoCancelExpiredPendingBookings(45).catch((err: any) => {
    logger.warn('Failed auto-cancelling expired pending bookings during availability check', { error: String(err) })
  })

  const cutoffDate = new Date(Date.now() - 45 * 60 * 1000)

  // Find room IDs that have an active (confirmed OR fresh pending < 45m) booking overlapping dates
  const overlapping = await db()
    .select({ roomId: bookingRooms.roomId })
    .from(bookingRooms)
    .innerJoin(bookings, eq(bookingRooms.bookingId, bookings.id))
    .where(
      and(
        ne(bookings.status, 'cancelled'),
        or(
          eq(bookings.status, 'confirmed'),
          and(
            eq(bookings.status, 'pending'),
            gte(bookings.createdAt, cutoffDate)
          )
        ),
        // Overlap: existing check_in < requested check_out AND existing check_out > requested check_in
        lt(bookings.checkIn, checkOut),
        gt(bookings.checkOut, checkIn),
      )
    )

  const bookedIds = [...new Set(overlapping.map(b => b.roomId))]
  logger.debug('Executing getAvailableRooms query', { checkIn, checkOut, bookedCount: bookedIds.length })

  if (bookedIds.length === 0) return db().select().from(rooms)

  return db().select().from(rooms).where(not(inArray(rooms.id, bookedIds)))
}

export async function getRoomById(roomId: string) {
  const [room] = await db()
    .select()
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1)
  return room ?? null
}
