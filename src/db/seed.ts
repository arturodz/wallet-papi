import { db } from "./index";
import { aircraft } from "./schema";

/**
 * Idempotent seed: inserts a single aircraft row if none exists yet.
 * Run with: npx tsx --env-file=.env.local src/db/seed.ts
 */
async function seed() {
  const existing = await db.select().from(aircraft).limit(1);
  if (existing.length > 0) {
    console.log(`Aircraft already seeded (${existing[0].tailNumber}); skipping.`);
    return;
  }

  const [inserted] = await db
    .insert(aircraft)
    .values({ tailNumber: "N12345", make: "Cirrus", model: "SR22" })
    .returning();
  console.log(`Seeded aircraft ${inserted.tailNumber} (${inserted.make} ${inserted.model}).`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
