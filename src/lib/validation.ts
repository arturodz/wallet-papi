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
  title: optionalString,
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

export const squawkInput = z.object({
  title: z.string().min(1, "title is required"),
  description: optionalString,
  severity: optionalString,
  status: z.enum(["open", "deferred", "resolved"]).default("open"),
  openedDate: dateString,
  equipmentId: optionalUuid,
  resolvedByServiceId: optionalUuid,
});

export const equipmentInput = z.object({
  name: z.string().min(1, "name is required"),
  category: optionalString,
  make: optionalString,
  model: optionalString,
  serial: optionalString,
  installDate: z.preprocess(emptyToUndefined, dateString.optional()),
  warrantyExpiry: z.preprocess(emptyToUndefined, dateString.optional()),
  notes: optionalString,
});

export const documentInput = z.object({
  blobUrl: z.string().url("expected a blob URL"),
  docType: z.preprocess(
    emptyToUndefined,
    z.enum(["invoice", "logbook", "warranty", "photo"]).optional(),
  ),
  extractedJson: optionalString,
  entityType: z.enum(["service", "expense", "squawk", "equipment"]),
  entityId: z.string().uuid("expected an entity id"),
});

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

export type SquawkInput = z.infer<typeof squawkInput>;
export type EquipmentInput = z.infer<typeof equipmentInput>;
export type IntervalInput = z.infer<typeof intervalInput>;
export type ServiceInput = z.infer<typeof serviceInput>;
export type ExpenseInput = z.infer<typeof expenseInput>;
export type AircraftInput = z.infer<typeof aircraftInput>;
export type DocumentInput = z.infer<typeof documentInput>;
