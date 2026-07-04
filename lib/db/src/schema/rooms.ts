import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  capacity: integer("capacity").notNull(),
  pricePerNight: integer("price_per_night").notNull(),
  description: text("description"),
  images: text("images").array(),
});

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;
