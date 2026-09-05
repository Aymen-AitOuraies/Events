import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";


// ====================
// USERS
// ====================

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "STAFF",
]);

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  username: varchar("email", { length: 255 }).notNull().unique(),

  passwordHash: text("password_hash").notNull(),
});


// ====================
// EVENTS
// ====================

export const eventsTable = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: varchar("title", { length: 255 }).notNull(),

  description: text("description"),

  location: varchar("location", { length: 255 }),

  startDate: timestamp("start_date").notNull(),

  endDate: timestamp("end_date").notNull(),

  createdBy: uuid("created_by")
    .notNull()
    .references(() => usersTable.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// ====================
// FORM FIELDS
// ====================

export const formFieldTypeEnum = pgEnum("form_field_type", [
  "TEXT",
  "EMAIL",
  "PHONE",
  "NUMBER",
  "DATE",
  "SELECT",
  "RADIO",
  "CHECKBOX",
]);

export const formFieldsTable = pgTable("form_fields", {
  id: uuid("id").defaultRandom().primaryKey(),

  eventId: uuid("event_id")
    .notNull()
    .references(() => eventsTable.id, {
      onDelete: "cascade",
    }),

  label: varchar("label", { length: 255 }).notNull(),

  type: formFieldTypeEnum("type").notNull(),

  required: boolean("required").notNull().default(false),

  options: jsonb("options"),

  position: integer("position").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// ====================
// REGISTRATIONS
// ====================

export const registrationsTable = pgTable(
  "registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    eventId: uuid("event_id")
      .notNull()
      .references(() => eventsTable.id, {
        onDelete: "cascade",
      }),

    name: varchar("name", { length: 255 }).notNull(),

    email: varchar("email", { length: 255 }).notNull(),

    qrToken: varchar("qr_token", { length: 255 }).notNull().unique(),

    checkedIn: boolean("checked_in").notNull().default(false),

    checkedInAt: timestamp("checked_in_at"),

    checkedInBy: uuid("checked_in_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("registrations_event_email_unique").on(
      table.eventId,
      table.email,
    ),
  ],
);


// ====================
// REGISTRATION Answers
// ====================

export const registrationAnswersTable = pgTable("registration_answers", {
  id: uuid("id").defaultRandom().primaryKey(),

  registrationId: uuid("registration_id")
    .notNull()
    .references(() => registrationsTable.id, {
      onDelete: "cascade",
    }),

  fieldId: uuid("field_id")
    .notNull()
    .references(() => formFieldsTable.id, {
      onDelete: "cascade",
    }),

  value: text("value").notNull(),
});