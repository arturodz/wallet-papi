"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { requireRole, getCurrentProfile } from "@/lib/auth/guard";
import { documentInput } from "@/lib/validation";
import { aiEnabled, blobEnabled } from "@/lib/env";
import { extractDocument } from "@/lib/gemini";
import type { Extraction } from "@/lib/extraction";

export interface UploadResult {
  blobUrl: string;
  fields: Extraction;
}

/**
 * Uploads an image to Vercel Blob and (if AI is enabled) extracts fields from it.
 * Never inserts a `documents` row — the caller reviews the fields and calls
 * `attachDocument` to persist. Throws BLOB_NOT_CONFIGURED if blob is unset.
 */
export async function uploadAndExtract(formData: FormData): Promise<UploadResult> {
  await requireRole("editor");

  if (!blobEnabled()) throw new Error("BLOB_NOT_CONFIGURED");

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("NO_FILE");

  const { url: blobUrl } = await put(
    `docs/${crypto.randomUUID()}-${file.name}`,
    file,
    { access: "public" },
  );

  if (!aiEnabled()) return { blobUrl, fields: {} };

  // Extraction failures must not lose the uploaded blob; degrade to no fields.
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const fields = await extractDocument(bytes, file.type || "image/jpeg");
    return { blobUrl, fields };
  } catch {
    return { blobUrl, fields: {} };
  }
}

const ROUTE_BY_ENTITY: Record<string, (id: string) => string[]> = {
  expense: () => ["/expenses"],
  equipment: (id) => [`/equipment/${id}`, "/equipment"],
  service: () => ["/services"],
  squawk: () => ["/squawks"],
};

/** Persists a reviewed document, polymorphically attached to an entity. */
export async function attachDocument(input: unknown) {
  await requireRole("editor");
  const data = documentInput.parse(input);
  const [row] = await db.insert(documents).values(data).returning();

  for (const path of ROUTE_BY_ENTITY[data.entityType]?.(data.entityId) ?? []) {
    revalidatePath(path);
  }
  return row;
}

/** Lists documents attached to an entity. Readable by any signed-in user. */
export async function listDocuments(entityType: string, entityId: string) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("UNAUTHENTICATED");

  return db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.entityType, entityType as never),
        eq(documents.entityId, entityId),
      ),
    )
    .orderBy(desc(documents.uploadedAt));
}

/** Deletes a document row and its blob (blob deletion is best-effort). */
export async function deleteDocument(id: string) {
  await requireRole("editor");

  const [row] = await db.select().from(documents).where(eq(documents.id, id));
  if (!row) return;

  if (blobEnabled()) {
    try {
      await del(row.blobUrl);
    } catch {
      // Best-effort: a missing/expired blob shouldn't block row deletion.
    }
  }

  await db.delete(documents).where(eq(documents.id, id));

  for (const path of ROUTE_BY_ENTITY[row.entityType]?.(row.entityId) ?? []) {
    revalidatePath(path);
  }
}
