import { db } from './client'
import { bookings, bookingRooms, rooms } from './schema'
import { and, eq, lt, gt, ne, inArray, sql } from 'drizzle-orm'
import { LookupBookingSchema, CancelBookingSchema, UpdateBookingSchema } from '../validation'
import { sendBookingNotifications } from '../twilio/notifications'
import { getRoomById } from './rooms'

export async function getBookingWithRooms(bookingId: string) {
  const [booking] = await db()
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) return null

  const roomLinks = await db()
    .select({ roomId: bookingRooms.roomId })
    .from(bookingRooms)
    .where(eq(bookingRooms.bookingId, bookingId))

  return {
    ...booking,
    roomIds: roomLinks.map(r => r.roomId),
  }
}

export async function getBookingsWithRooms(ids: string[]) {
  if (ids.length === 0) return []

  const fetchedBookings = await db()
    .select()
    .from(bookings)
    .where(inArray(bookings.id, ids))

  if (fetchedBookings.length === 0) return []

  const roomLinks = await db()
    .select()
    .from(bookingRooms)
    .where(inArray(bookingRooms.bookingId, ids))

  const roomMap: Record<string, string[]> = {}
  for (const link of roomLinks) {
    if (!roomMap[link.bookingId]) roomMap[link.bookingId] = []
    roomMap[link.bookingId].push(link.roomId)
  }

  return fetchedBookings.map(b => ({
    ...b,
    roomIds: roomMap[b.id] ?? [],
  }))
}

export async function getRoomIdsForBooking(bookingId: string): Promise<string[]> {
  const links = await db()
    .select({ roomId: bookingRooms.roomId })
    .from(bookingRooms)
    .where(eq(bookingRooms.bookingId, bookingId))
  return links.map(l => l.roomId)
}

export async function lookupBooking(phone: string, bookingId: string) {
  const validated = LookupBookingSchema.parse({ phone, bookingId })

  const [booking] = await db()
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.id, validated.bookingId),
        eq(bookings.phone, validated.phone),
        ne(bookings.status, 'cancelled')
      )
    )
    .limit(1)

  if (!booking) return null

  const roomIds = await getRoomIdsForBooking(booking.id)
  return {
    ...booking,
    roomIds,
  }
}

export async function cancelBooking(bookingId: string, phone: string) {
  const validated = CancelBookingSchema.parse({ bookingId, phone })

  const booking = await db()
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.id, validated.bookingId),
        ne(bookings.status, 'cancelled')
      )
    )
    .limit(1)

  if (!booking[0] || booking[0].phone !== validated.phone) {
    return null
  }

  const [updated] = await db()
    .update(bookings)
    .set({ status: 'cancelled' })
    .where(eq(bookings.id, validated.bookingId))
    .returning()

  const roomIds = await getRoomIdsForBooking(updated.id)

  // Sync cancellation status to Google Sheets (non-blocking)
  const { updateBookingStatusInSheet } = require('../sheets/sync')
  updateBookingStatusInSheet(updated.id, 'cancelled').catch((err: any) => {
    console.error('Google Sheets cancellation sync failed:', err)
  })

  return {
    ...updated,
    roomIds,
  }
}

export async function updateBookingFromSheet(data: unknown): Promise<
  | { success: true; booking: typeof bookings.$inferSelect & { roomIds: string[] } }
  | { success: false; error: string; code: 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT' | 'INTERNAL' }
> {
  let validated: ReturnType<typeof UpdateBookingSchema.parse> extends Promise<infer T> ? T : ReturnType<typeof UpdateBookingSchema.parse>
  try {
    validated = UpdateBookingSchema.parse(data)
  } catch (err: any) {
    const message = err?.issues?.[0]?.message ?? 'Invalid booking data'
    return { success: false, error: message, code: 'VALIDATION' }
  }

  try {
    const uniqueRoomIds = [...new Set(validated.roomIds)]
    if (uniqueRoomIds.length === 0) {
      return { success: false, error: 'At least one valid room ID is required', code: 'VALIDATION' }
    }

    // Check that booking exists
    const [existing] = await db()
      .select()
      .from(bookings)
      .where(eq(bookings.id, validated.id))
      .limit(1)

    // Check overlap conflicts for each room if status is changing to confirmed
    if (validated.status === 'confirmed') {
      for (const rId of uniqueRoomIds) {
        const overlapping = await db()
          .select({ count: sql<number>`count(*)::int` })
          .from(bookingRooms)
          .innerJoin(bookings, eq(bookingRooms.bookingId, bookings.id))
          .where(
            and(
              eq(bookingRooms.roomId, rId),
              eq(bookings.status, 'confirmed'),
              ne(bookings.id, validated.id),
              lt(bookings.checkIn, validated.checkOut),
              gt(bookings.checkOut, validated.checkIn)
            )
          )

        const count = Number(overlapping[0]?.count ?? 0)
        if (count > 0) {
          return {
            success: false,
            error: `Room ${rId} is already booked for selected dates`,
            code: 'CONFLICT',
          }
        }
      }
    }

    const wasPending = existing ? existing.status === 'pending' : false

    // Perform database updates atomically in a transaction
    const resultBooking = await db().transaction(async (tx) => {
      let bookingHeader: typeof bookings.$inferSelect

      if (!existing) {
        const [inserted] = await tx
          .insert(bookings)
          .values({
            id: validated.id,
            guestName: validated.guestName,
            phone: validated.phone,
            checkIn: validated.checkIn,
            checkOut: validated.checkOut,
            guests: validated.guests,
            status: validated.status,
          })
          .returning()
        bookingHeader = inserted
      } else {
        const [updated] = await tx
          .update(bookings)
          .set({
            guestName: validated.guestName,
            phone: validated.phone,
            checkIn: validated.checkIn,
            checkOut: validated.checkOut,
            guests: validated.guests,
            status: validated.status,
          })
          .where(eq(bookings.id, validated.id))
          .returning()
        bookingHeader = updated
      }

      // Sync booking_rooms junction entries
      await tx.delete(bookingRooms).where(eq(bookingRooms.bookingId, validated.id))
      for (const rId of uniqueRoomIds) {
        await tx.insert(bookingRooms).values({
          bookingId: validated.id,
          roomId: rId,
        })
      }

      return bookingHeader
    })

    // Trigger SMS notification ONLY when status transitions from pending -> confirmed (or new sheet addition as confirmed)
    if ((wasPending || !existing) && resultBooking.status === 'confirmed') {
      const checkInDate = new Date(resultBooking.checkIn)
      const checkOutDate = new Date(resultBooking.checkOut)
      const totalNights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)))

      let totalBookingPrice = 0
      const bookingsData = []

      for (const rId of uniqueRoomIds) {
        const room = await getRoomById(rId)
        const price = totalNights * (room?.pricePerNight || 0)
        totalBookingPrice += price
        bookingsData.push({
          bookingId: resultBooking.id,
          roomName: room?.name || `Room ${rId}`,
          roomType: room?.type || 'Standard',
          pricePerNight: room?.pricePerNight || 0,
          totalPrice: price,
        })
      }

      sendBookingNotifications({
        guestName: resultBooking.guestName,
        phone: resultBooking.phone,
        checkIn: resultBooking.checkIn,
        checkOut: resultBooking.checkOut,
        totalNights,
        totalPrice: totalBookingPrice,
        bookings: bookingsData,
      }).catch((err) => console.error('Owner approval SMS notification error:', err))
    }

    return {
      success: true,
      booking: {
        ...resultBooking,
        roomIds: uniqueRoomIds,
      },
    }
  } catch (err: any) {
    console.error('updateBookingFromSheet error:', err)
    return { success: false, error: 'Internal database error', code: 'INTERNAL' }
  }
}