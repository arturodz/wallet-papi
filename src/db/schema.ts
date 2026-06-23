import {
  pgTable, pgEnum, uuid, text, integer, numeric, timestamp, date, real,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "editor", "viewer"]);
export const intervalKindEnum = pgEnum("interval_kind", ["calendar", "hours", "both"]);
export const squawkStatusEnum = pgEnum("squawk_status", ["open", "deferred", "resolved"]);
export const docTypeEnum = pgEnum("doc_type", ["invoice", "logbook", "warranty", "photo"]);
export const entityTypeEnum = pgEnum("entity_type", ["service", "expense", "squawk", "equipment"]);

export const aircraft = pgTable("aircraft", {
  id: uuid("id").primaryKey().defaultRandom(),
  tailNumber: text("tail_number").notNull(),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  serial: text("serial"),
  currentTach: real("current_tach").notNull().default(0),
  currentHobbs: real("current_hobbs").notNull().default(0),
  hoursUpdatedAt: timestamp("hours_updated_at", { withTimezone: true }),
  acquiredDate: date("acquired_date"),
  acquisitionTach: real("acquisition_tach"), // tach at purchase; anchors cost-per-hour in TCO
});

export const profiles = pgTable("profiles", {
  // userId is the Neon Auth user id (subject), not generated here.
  userId: text("user_id").primaryKey(),
  email: text("email"),
  role: roleEnum("role").notNull().default("viewer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const equipment = pgTable("equipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  aircraftId: uuid("aircraft_id").notNull().references(() => aircraft.id),
  name: text("name").notNull(),
  category: text("category"),
  make: text("make"),
  model: text("model"),
  serial: text("serial"),
  installDate: date("install_date"),
  warrantyExpiry: date("warranty_expiry"),
  notes: text("notes"),
});

export const intervals = pgTable("intervals", {
  id: uuid("id").primaryKey().defaultRandom(),
  aircraftId: uuid("aircraft_id").notNull().references(() => aircraft.id),
  name: text("name").notNull(),
  kind: intervalKindEnum("kind").notNull(),
  intervalMonths: integer("interval_months"),
  intervalHours: real("interval_hours"),
  lastDoneDate: date("last_done_date"),
  lastDoneHours: real("last_done_hours"),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  aircraftId: uuid("aircraft_id").notNull().references(() => aircraft.id),
  date: date("date").notNull(),
  tachAtService: real("tach_at_service"),
  description: text("description").notNull(),
  vendor: text("vendor"),
  category: text("category"),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
  satisfiesIntervalId: uuid("satisfies_interval_id").references(() => intervals.id),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  aircraftId: uuid("aircraft_id").notNull().references(() => aircraft.id),
  date: date("date").notNull(),
  title: text("title"),
  payee: text("payee"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category"),
  notes: text("notes"),
  serviceId: uuid("service_id").references(() => services.id),
});

export const squawks = pgTable("squawks", {
  id: uuid("id").primaryKey().defaultRandom(),
  aircraftId: uuid("aircraft_id").notNull().references(() => aircraft.id),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity"),
  status: squawkStatusEnum("status").notNull().default("open"),
  openedDate: date("opened_date").notNull(),
  resolvedDate: date("resolved_date"),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
  resolvedByServiceId: uuid("resolved_by_service_id").references(() => services.id),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  blobUrl: text("blob_url").notNull(),
  docType: docTypeEnum("doc_type"),
  extractedJson: text("extracted_json"), // raw Gemini JSON, parsed on read
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  entityType: entityTypeEnum("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
});
