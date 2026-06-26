import { db } from './client'
import { bookings } from './schema'
import { and, eq, ilike, lt, gt, ne, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { CreateBookingSchema, LookupBookingSchema, CancelBookingSchema, UpdateBookingSchema } from '../validation'

export async function createBooking(data: unknown) {
  const validated = CreateBookingSchema.parse(data)

  const id = 'BK-' + nanoid(6).toUpperCase()
  const [booking] = await db.insert(bookings).values({
    guestName: validated.guestName,
    phone: validated.phone,
    roomId: validated.roomId,
    checkIn: validated.checkIn,
    checkOut: validated.checkOut,
    guests: validated.guests,
    id,
  }).returning()

  return booking
}

export async function lookupBooking(guestName: string, phone: string) {
  const validated = LookupBookingSchema.parse({ guestName, phone })

  const [booking] = await db
    .select()
    .from(bookings)
    .where(
      and(
        ilike(bookings.guestName, `%${validated.guestName}%`),
        eq(bookings.phone, validated.phone),
        eq(bookings.status, 'confirmed')
      )
    )
    .limit(1)

  return booking ?? null
}

export async function cancelBooking(bookingId: string, guestName: string, phone: string) {
  const validated = CancelBookingSchema.parse({ bookingId, guestName, phone })

  const booking = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.id, validated.bookingId),
        eq(bookings.status, 'confirmed')
      )
    )
    .limit(1)

  if (!booking[0]) {
    return null
  }

  if (booking[0].guestName.toLowerCase() !== validated.guestName.toLowerCase() ||
      booking[0].phone !== validated.phone) {
    return null
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: 'cancelled' })
    .where(eq(bookings.id, validated.bookingId))
    .returning()

  return updated
}

export async function updateBookingFromSheet(data: unknown): Promise<
  | { success: true; booking: typeof bookings.$inferSelect }
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
    // Check that the booking exists
    const [existing] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, validated.id))
      .limit(1)

    if (!existing) {
      return { success: false, error: `Booking ${validated.id} not found`, code: 'NOT_FOUND' }
    }

    // If status is changing to confirmed, or room/dates are changing on a confirmed booking,
    // check for overlapping bookings (exclude this booking itself)
    const needsOverlapCheck =
      validated.status === 'confirmed' && (
        existing.roomId !== validated.roomId ||
        existing.checkIn !== validated.checkIn ||
        existing.checkOut !== validated.checkOut ||
        existing.status !== 'confirmed'
      )

    if (needsOverlapCheck) {
      const overlapping = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(bookings)
        .where(
          and(
            eq(bookings.roomId, validated.roomId),
            eq(bookings.status, 'confirmed'),
            ne(bookings.id, validated.id),
            lt(bookings.checkIn, validated.checkOut),
            gt(bookings.checkOut, validated.checkIn)
          )
        )

      const overlapCount = Number(overlapping[0]?.count ?? 0)
      if (overlapCount > 0) {
        return {
          success: false,
          error: `Room ${validated.roomId} is already booked for those dates`,
          code: 'CONFLICT',
        }
      }
    }

    // Update the booking
    const [updated] = await db
      .update(bookings)
      .set({
        guestName: validated.guestName,
        phone: validated.phone,
        roomId: validated.roomId,
        checkIn: validated.checkIn,
        checkOut: validated.checkOut,
        guests: validated.guests,
        status: validated.status,
      })
      .where(eq(bookings.id, validated.id))
      .returning()

    return { success: true, booking: updated }
  } catch (err: any) {
    console.error('updateBookingFromSheet error:', err)
    return { success: false, error: 'Internal database error', code: 'INTERNAL' }
  }
}