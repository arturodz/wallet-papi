"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { requireRole } from "@/lib/auth/guard";
import { expenseInput } from "@/lib/validation";

export async function createExpense(input: unknown) {
  await requireRole("editor");
  const data = expenseInput.parse(input);
  const [row] = await db.insert(expenses).values(data).returning();
  revalidatePath("/expenses");
  revalidatePath("/tco");
  revalidatePath("/");
  return row;
}

export async function updateExpense(id: string, input: unknown) {
  await requireRole("editor");
  const data = expenseInput.parse(input);
  const [row] = await db
    .update(expenses)
    .set(data)
    .where(eq(expenses.id, id))
    .returning();
  revalidatePath("/expenses");
  revalidatePath("/tco");
  revalidatePath("/");
  return row;
}

export async function deleteExpense(id: string) {
  await requireRole("editor");
  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/expenses");
  revalidatePath("/tco");
  revalidatePath("/");
}
