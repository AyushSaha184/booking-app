import { db } from "@workspace/db";
import { rooms, bookings } from "@workspace/db";
import { and, eq, lt, gt, not, inArray, sql, ne } from "drizzle-orm";
import { nanoid } from "nanoid";
import { logger } from "./logger";
import { CreateBookingSchema, LookupBookingSchema, CancelBookingSchema, UpdateBookingSchema } from "./validation";

export async function getAvailableRooms(checkIn: string, checkOut: string) {
  const overlapping = await db
    .select({ roomId: bookings.roomId })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "confirmed"),
        lt(bookings.checkIn, checkOut),
        gt(bookings.checkOut, checkIn)
      )
    );

  const bookedIds = overlapping.map((b) => b.roomId);
  logger.debug({ checkIn, checkOut, bookedCount: bookedIds.length }, "getAvailableRooms query");

  if (bookedIds.length === 0) return db.select().from(rooms);
  return db.select().from(rooms).where(not(inArray(rooms.id, bookedIds)));
}

export async function getRoomById(roomId: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
  return room ?? null;
}

export async function atomicCreateBooking(data: {
  guestName: string;
  phone: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}): Promise<{ success: true; booking: any } | { success: false; error: string; retry: boolean }> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const id = "BK-" + nanoid(6).toUpperCase();

      const booking = await db.transaction(
        async (tx) => {
          const overlapping = await tx
            .select({ count: sql<number>`count(*)::int` })
            .from(bookings)
            .where(
              and(
                eq(bookings.roomId, data.roomId),
                eq(bookings.status, "confirmed"),
                lt(bookings.checkIn, data.checkOut),
                gt(bookings.checkOut, data.checkIn)
              )
            );

          const overlapCount = Number(overlapping[0]?.count ?? 0);
          if (overlapCount > 0) {
            throw new Error("Room is no longer available for selected dates");
          }

          const [created] = await tx
            .insert(bookings)
            .values({
              id,
              guestName: data.guestName,
              phone: data.phone,
              roomId: data.roomId,
              checkIn: data.checkIn,
              checkOut: data.checkOut,
              guests: data.guests,
              status: "confirmed",
            })
            .returning();

          return created;
        },
        { isolationLevel: "serializable" }
      );

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
      };
    } catch (err: any) {
      const errorMessage = (err?.message ?? err?.toString() ?? "").toLowerCase();
      const errorCode = err?.code ?? "";

      if (
        errorCode === "40001" ||
        errorMessage.includes("serialization") ||
        errorMessage.includes("could not serialize")
      ) {
        if (attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 50));
          continue;
        }
        return { success: false, error: "Booking conflict, please try again", retry: true };
      }

      if (errorMessage.includes("no longer available")) {
        return { success: false, error: "Room is no longer available for selected dates", retry: false };
      }

      logger.error({ err: err?.message, attempt }, "atomicCreateBooking error");
      return { success: false, error: "Failed to create booking", retry: false };
    }
  }

  return { success: false, error: "Failed to create booking after retries", retry: true };
}

export async function lookupBooking(guestName: string, phone: string) {
  const validated = LookupBookingSchema.parse({ guestName, phone });

  const [booking] = await db
    .select()
    .from(bookings)
    .where(
      and(
        sql`lower(${bookings.guestName}) = lower(${validated.guestName})`,
        eq(bookings.phone, validated.phone),
        eq(bookings.status, "confirmed")
      )
    )
    .limit(1);

  return booking ?? null;
}

export async function cancelBooking(bookingId: string, guestName: string, phone: string) {
  const validated = CancelBookingSchema.parse({ bookingId, guestName, phone });

  const existing = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, validated.bookingId), eq(bookings.status, "confirmed")))
    .limit(1);

  if (!existing[0]) return null;

  if (
    existing[0].guestName.toLowerCase() !== validated.guestName.toLowerCase() ||
    existing[0].phone !== validated.phone
  ) {
    return null;
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: "cancelled" })
    .where(eq(bookings.id, validated.bookingId))
    .returning();

  return updated;
}

export async function updateBookingFromSheet(data: unknown): Promise<
  | { success: true; booking: any }
  | { success: false; error: string; code: "NOT_FOUND" | "VALIDATION" | "CONFLICT" | "INTERNAL" }
> {
  let validated: ReturnType<typeof UpdateBookingSchema.parse>;
  try {
    validated = UpdateBookingSchema.parse(data);
  } catch (err: any) {
    const message = err?.issues?.[0]?.message ?? "Invalid booking data";
    return { success: false, error: message, code: "VALIDATION" };
  }

  try {
    const [existing] = await db.select().from(bookings).where(eq(bookings.id, validated.id)).limit(1);
    if (!existing) {
      return { success: false, error: `Booking ${validated.id} not found`, code: "NOT_FOUND" };
    }

    const needsOverlapCheck =
      validated.status === "confirmed" &&
      (existing.roomId !== validated.roomId ||
        existing.checkIn !== validated.checkIn ||
        existing.checkOut !== validated.checkOut ||
        existing.status !== "confirmed");

    if (needsOverlapCheck) {
      const overlapping = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(bookings)
        .where(
          and(
            eq(bookings.roomId, validated.roomId),
            eq(bookings.status, "confirmed"),
            ne(bookings.id, validated.id),
            lt(bookings.checkIn, validated.checkOut),
            gt(bookings.checkOut, validated.checkIn)
          )
        );

      const overlapCount = Number(overlapping[0]?.count ?? 0);
      if (overlapCount > 0) {
        return { success: false, error: `Room ${validated.roomId} is already booked`, code: "CONFLICT" };
      }
    }

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
      .returning();

    return { success: true, booking: updated };
  } catch (err: any) {
    logger.error({ err: err?.message }, "updateBookingFromSheet error");
    return { success: false, error: "Internal database error", code: "INTERNAL" };
  }
}
