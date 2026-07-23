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

  // Sync cancellation status to Google Sheets
  const { updateBookingStatusInSheet } = require('../sheets/sync')
  await updateBookingStatusInSheet(updated.id, 'cancelled').catch((err: any) => {
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
    const rawRoomIds = [...new Set(validated.roomIds)]

    // Check existing booking
    const [existing] = await db()
      .select()
      .from(bookings)
      .where(eq(bookings.id, validated.id))
      .limit(1)

    // Validate which room IDs actually exist in DB rooms table
    let validRoomIds: string[] = []
    if (rawRoomIds.length > 0) {
      const dbRooms = await db()
        .select({ id: rooms.id })
        .from(rooms)
        .where(inArray(rooms.id, rawRoomIds))
      validRoomIds = dbRooms.map(r => r.id)
    }

    // Fallback: If raw room IDs from sheet are invalid (e.g., date strings, column misalignments), use existing room IDs from DB
    let targetRoomIds = validRoomIds
    if (targetRoomIds.length === 0 && existing) {
      targetRoomIds = await getRoomIdsForBooking(existing.id)
    }

    if (targetRoomIds.length === 0) {
      return { success: false, error: 'At least one valid room ID is required', code: 'VALIDATION' }
    }

    // Check overlap conflicts for each room if status is changing to confirmed
    if (validated.status === 'confirmed') {
      for (const rId of targetRoomIds) {
        const overlapping = await txCountOverlaps(rId, validated.id, validated.checkIn, validated.checkOut)
        if (overlapping > 0) {
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

      // Sync booking_rooms junction entries safely
      await tx.delete(bookingRooms).where(eq(bookingRooms.bookingId, validated.id))
      for (const rId of targetRoomIds) {
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

      for (const rId of targetRoomIds) {
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
        roomIds: targetRoomIds,
      },
    }
  } catch (err: any) {
    console.error('updateBookingFromSheet error:', err)
    return { success: false, error: 'Internal database error', code: 'INTERNAL' }
  }
}

async function txCountOverlaps(roomId: string, bookingId: string, checkIn: string, checkOut: string): Promise<number> {
  const overlapping = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(bookingRooms)
    .innerJoin(bookings, eq(bookingRooms.bookingId, bookings.id))
    .where(
      and(
        eq(bookingRooms.roomId, roomId),
        eq(bookings.status, 'confirmed'),
        ne(bookings.id, bookingId),
        lt(bookings.checkIn, checkOut),
        gt(bookings.checkOut, checkIn)
      )
    )
  return Number(overlapping[0]?.count ?? 0)
}

export async function autoCancelExpiredPendingBookings(maxAgeMinutes: number = 45): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000)
    const expired = await db()
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.status, 'pending'),
          lt(bookings.createdAt, cutoff)
        )
      )

    if (expired.length === 0) return 0

    const expiredIds = expired.map(b => b.id)

    await db()
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(inArray(bookings.id, expiredIds))

    const { updateBookingStatusInSheet } = require('../sheets/sync')
    for (const id of expiredIds) {
      updateBookingStatusInSheet(id, 'cancelled').catch(() => {})
    }

    return expiredIds.length
  } catch (err) {
    console.error('Error auto-cancelling expired pending bookings:', err)
    return 0
  }
}