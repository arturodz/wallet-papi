import { z } from "zod";

const emptyToUndefined = (v: unknown) => (v === "" || v == null ? undefined : v);

// Treats "" (empty form field) as undefined before applying the inner schema.
const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().optional(),
);

const optionalUuid = z.preprocess(
  emptyToUndefined,
  z.string().uuid().optional(),
);

// Form number inputs arrive as strings; coerce, treat "" as undefined.
const optionalNumber = z.preprocess(
  emptyToUndefined,
  z.coerce.number().finite().optional(),
);

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export const serviceInput = z.object({
  date: dateString,
  description: z.string().min(1, "description is required"),
  vendor: optionalString,
  category: optionalString,
  tachAtService: optionalNumber,
  equipmentId: optionalUuid,
  satisfiesIntervalId: optionalUuid,
});

export const expenseInput = z.object({
  date: dateString,
  payee: optionalString,
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "expected a dollar amount"),
  category: optionalString,
  notes: optionalString,
  serviceId: optionalUuid,
});

export const intervalInput = z
  .object({
    name: z.string().min(1, "name is required"),
    kind: z.enum(["calendar", "hours", "both"]),
    intervalMonths: optionalNumber,
    intervalHours: optionalNumber,
    lastDoneDate: z.preprocess(emptyToUndefined, dateString.optional()),
    lastDoneHours: optionalNumber,
    equipmentId: optionalUuid,
  })
  .refine(
    (v) => v.kind === "hours" || v.intervalMonths != null,
    { message: "intervalMonths is required for calendar/both", path: ["intervalMonths"] },
  )
  .refine(
    (v) => v.kind === "calendar" || v.intervalHours != null,
    { message: "intervalHours is required for hours/both", path: ["intervalHours"] },
  );

export const aircraftInput = z.object({
  tailNumber: z.string().min(1, "tail number is required"),
  make: optionalString,
  model: optionalString,
  year: optionalNumber,
  serial: optionalString,
  currentTach: optionalNumber,
  currentHobbs: optionalNumber,
  acquiredDate: z.preprocess(emptyToUndefined, dateString.optional()),
  acquisitionTach: optionalNumber,
});

export type IntervalInput = z.infer<typeof intervalInput>;
export type ServiceInput = z.infer<typeof serviceInput>;
export type ExpenseInput = z.infer<typeof expenseInput>;
export type AircraftInput = z.infer<typeof aircraftInput>;
