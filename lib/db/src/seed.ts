import { db } from "./index";
import { rooms } from "./schema/rooms";

const ROOMS_DATA = [
  {
    id: "room-standard-01",
    name: "Classic Valley Room",
    type: "Standard",
    capacity: 2,
    pricePerNight: 3500,
    description: "A cozy standard room with beautiful valley views, perfect for couples.",
    images: [],
  },
  {
    id: "room-standard-02",
    name: "Garden View Room",
    type: "Standard",
    capacity: 2,
    pricePerNight: 3200,
    description: "A comfortable room overlooking our lush green gardens.",
    images: [],
  },
  {
    id: "room-deluxe-01",
    name: "Deluxe Pool View Room",
    type: "Deluxe",
    capacity: 3,
    pricePerNight: 5500,
    description: "A spacious deluxe room with stunning pool and landscape views.",
    images: [],
  },
  {
    id: "room-deluxe-02",
    name: "Deluxe Family Room",
    type: "Deluxe",
    capacity: 4,
    pricePerNight: 6500,
    description: "Ideal for families, with extra space and premium amenities.",
    images: [],
  },
  {
    id: "room-suite-01",
    name: "Royal Suite",
    type: "Suite",
    capacity: 2,
    pricePerNight: 12000,
    description: "Our most exclusive suite with panoramic views, a private sitting area, and premium furnishings.",
    images: [],
  },
  {
    id: "room-suite-02",
    name: "Honeymoon Suite",
    type: "Suite",
    capacity: 2,
    pricePerNight: 10000,
    description: "Specially designed for couples, featuring romantic decor and a private balcony.",
    images: [],
  },
];

async function seed() {
  console.log("Seeding rooms...");
  for (const room of ROOMS_DATA) {
    await db
      .insert(rooms)
      .values(room)
      .onConflictDoNothing();
  }
  console.log(`Seeded ${ROOMS_DATA.length} rooms.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
