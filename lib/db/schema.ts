import { pgTable, text, integer, date, timestamp } from 'drizzle-orm/pg-core'

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),           // e.g. "101"
  name: text('name').notNull(),          // e.g. "Deluxe Room 101"
  type: text('type').notNull(),          // "standard" | "deluxe" | "suite"
  capacity: integer('capacity').notNull(),
  pricePerNight: integer('price_per_night').notNull(),
  description: text('description'),
})

export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),           // e.g. "BK-XJ9K"
  guestName: text('guest_name').notNull(),
  phone: text('phone').notNull(),        // identity key for lookup
  roomId: text('room_id').notNull().references(() => rooms.id),
  checkIn: date('check_in').notNull(),
  checkOut: date('check_out').notNull(),
  guests: integer('guests').notNull(),
  status: text('status').notNull().default('confirmed'), // "confirmed" | "cancelled"
  createdAt: timestamp('created_at').defaultNow(),
})
