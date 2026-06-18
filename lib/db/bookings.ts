import { db } from './client'
import { bookings } from './schema'
import { and, eq, ilike } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { CreateBookingSchema, LookupBookingSchema, CancelBookingSchema } from '../validation'

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