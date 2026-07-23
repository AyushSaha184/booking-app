import { pgTable, text, integer, date, timestamp, primaryKey } from 'drizzle-orm/pg-core'

/* ── Room Schema ─────────────────────────────────── */
export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),           // e.g. "101"
  name: text('name').notNull(),          // e.g. "Deluxe Room 101"
  type: text('type').notNull(),          // "standard" | "deluxe" | "suite"
  capacity: integer('capacity').notNull(),
  pricePerNight: integer('price_per_night').notNull(),
  description: text('description'),
  images: text('images').array(),        // optional image URLs
})

/* ── User Schema ─────────────────────────────────── */
export const users = pgTable('users', {
  id: text('id').primaryKey(),           // e.g. "USR-XJ9K"
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow(),
})

/* ── Booking Schema ───────────────────────────────── */
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),           // e.g. "BK-XJ9K"
  guestName: text('guest_name').notNull(),
  phone: text('phone').notNull(),        // identity key for lookup
  userId: text('user_id').references(() => users.id),
  checkIn: date('check_in').notNull(),
  checkOut: date('check_out').notNull(),
  guests: integer('guests').notNull(),
  status: text('status').notNull().default('pending'), // "pending" | "confirmed" | "cancelled"
  createdAt: timestamp('created_at').defaultNow(),
})

/* ── Booking Rooms Junction Table ─────────────────── */
export const bookingRooms = pgTable('booking_rooms', {
  bookingId: text('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  roomId: text('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
}, (t) => [
  primaryKey({ columns: [t.bookingId, t.roomId] }),
])
