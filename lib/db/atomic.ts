import { neon } from '@neondatabase/serverless'
import { db } from './client'
import { bookings } from './schema'
import { bookings as bookingsTable } from './schema'
import { and, eq, sql, lt, gt } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function atomicCreateBooking(data: {
  guestName: string
  phone: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
}): Promise<{ success: true; booking: any } | { success: false; error: string; retry: boolean }> {
  const maxRetries = 3

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const id = 'BK-' + nanoid(6).toUpperCase()

      const overlapping = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(bookings)
        .where(
          and(
            eq(bookings.roomId, data.roomId),
            eq(bookings.status, 'confirmed'),
            lt(bookings.checkIn, data.checkOut),
            gt(bookings.checkOut, data.checkIn)
          )
        )

      const overlapCount = Number(overlapping[0]?.count ?? 0)

      if (overlapCount > 0) {
        return { success: false, error: 'Room is no longer available for selected dates', retry: false }
      }

      const [booking] = await db
        .insert(bookings)
        .values({
          id,
          guestName: data.guestName,
          phone: data.phone,
          roomId: data.roomId,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
          status: 'confirmed',
        })
        .returning()

      return {
        success: true,
        booking: {
          id: booking.id,
          guestName: booking.guestName,
          phone: booking.phone,
          roomId: booking.roomId,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guests,
          status: booking.status,
          createdAt: booking.createdAt,
        },
      }
    } catch (err: any) {
      const errorMessage = (err?.message ?? err?.toString() ?? '').toLowerCase()
      const errorCode = err?.code ?? ''

      if (
        errorMessage.includes('serialization') ||
        errorMessage.includes('deadlock') ||
        errorCode === '40001' ||
        errorMessage.includes('lock') ||
        errorMessage.includes('conflict')
      ) {
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)))
          continue
        }
        return { success: false, error: 'Booking failed due to concurrent request. Please try again.', retry: true }
      }

      if (
        errorMessage.includes('duplicate') ||
        errorMessage.includes('unique') ||
        errorCode === '23505'
      ) {
        return { success: false, error: 'Room is no longer available for selected dates', retry: false }
      }

      throw err
    }
  }

  return { success: false, error: 'Booking failed. Please try again.', retry: true }
}