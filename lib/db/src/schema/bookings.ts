import { pgTable, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { rooms } from "./rooms";

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  guestName: text("guest_name").notNull(),
  phone: text("phone").notNull(),
  roomId: text("room_id")
    .notNull()
    .references(() => rooms.id),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  guests: integer("guests").notNull(),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
