import { db } from './client'
import { bookings, rooms } from './schema'
import { and, eq, lt, gt, not, inArray } from 'drizzle-orm'
import { logger } from '../logger'

export async function getAvailableRooms(checkIn: string, checkOut: string) {
  // Find room IDs that have a confirmed booking overlapping the requested dates
  const overlapping = await db()
    .select({ roomId: bookings.roomId })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, 'confirmed'),
        // Overlap: existing check_in < requested check_out AND existing check_out > requested check_in
        lt(bookings.checkIn, checkOut),
        gt(bookings.checkOut, checkIn),
      )
    )

  const bookedIds = overlapping.map(b => b.roomId)
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
