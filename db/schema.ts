// db/schema.ts
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enum for modes
export const learningModeEnum = pgEnum("learning_mode", [
  "sequential",
  "reverse",
  "select",
]);

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),

  // Current Learning State
  learningMode: learningModeEnum("learning_mode").default("sequential"), // Added mode
  currentSurahId: integer("current_surah_id").default(1), // Start with Al-Fatiha
  currentAyah: integer("current_ayah").default(1), // Start at Ayat 1
  completedAyahsToday: integer("completed_ayahs_today").default(0), // For daily goals

  // Tracking Progress (for display)
  dayNumber: integer("day_number").default(1), // Which day of memorization

  lastUpdated: timestamp("last_updated").defaultNow(),
});
