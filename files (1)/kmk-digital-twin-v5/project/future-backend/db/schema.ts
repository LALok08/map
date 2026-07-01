import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * Memory System (PRD §12).
 * Memories are attached to a building via buildingId but are fully
 * decoupled from the GIS / Scene layers — the campus never depends on them.
 */
export const memories = pgTable(
  "memories",
  {
    id: serial("id").primaryKey(),
    buildingId: varchar("building_id", { length: 16 }).notNull(),
    buildingName: varchar("building_name", { length: 120 }).notNull(),
    author: varchar("author", { length: 80 }).notNull(),
    role: varchar("role", { length: 24 }).notNull().default("student"), // student | alumni | staff | visitor
    gradYear: integer("grad_year"),
    faculty: varchar("faculty", { length: 80 }),
    message: text("message").notNull(),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("memories_building_idx").on(t.buildingId),
    index("memories_created_idx").on(t.createdAt),
  ],
);

export type Memory = typeof memories.$inferSelect;
export type NewMemory = typeof memories.$inferInsert;
