import { 
  integer, 
  varchar, 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  jsonb, 
  boolean,
  primaryKey,
  uniqueIndex
} from "drizzle-orm/pg-core";

// Users table with improved constraints
export const Users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 })
    .notNull()
    .unique("users_email_unique"),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  phone: varchar("phone", { length: 20 }).notNull(), // Reduced length for phone numbers
  role: varchar("role", { length: 2 })
    .notNull()
    .default('0'), // '0'=user, '1'=admin, '2'=other roles
}, (table) => {
  return {
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    phoneIdx: uniqueIndex("users_phone_idx").on(table.phone),
  };
});

// Reports table with foreign key constraints
export const Reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id, { onDelete: "cascade" })
    .notNull(),
  location: text("location").notNull(),
  wasteType: varchar("waste_type", { length: 50 }).notNull(), // Reduced length for enum-like values
  amount: varchar("amount", { length: 50 }).notNull(),
  imageUrl: text("image_url"),
  verificationResult: jsonb("verification_result"),
  status: varchar("status", { length: 20 })
    .notNull()
    .default("pending"), // pending, verified, collected
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  collectorId: integer("collector_id")
    .references(() => Users.id, { onDelete: "set null" }),
}, (table) => {
  return {
    userIdx: uniqueIndex("reports_user_idx").on(table.userId),
    statusIdx: uniqueIndex("reports_status_idx").on(table.status),
  };
});

// Rewards table with improved timestamp handling
export const Rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id, { onDelete: "cascade" })
    .notNull(),
  points: integer("points").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  description: text("description"),
  name: varchar("name", { length: 100 }).notNull(), // Reduced length for names
  collectionInfo: text("collection_info").notNull(),
}, (table) => {
  return {
    userIdx: uniqueIndex("rewards_user_idx").on(table.userId),
  };
});

// CollectedWastes table with explicit naming
export const CollectedWastes = pgTable("collected_wastes", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id")
    .references(() => Reports.id, { onDelete: "cascade" })
    .notNull(),
  collectorId: integer("collector_id")
    .references(() => Users.id, { onDelete: "restrict" })
    .notNull(),
  collectionDate: timestamp("collection_date", { withTimezone: true })
    .notNull(),
  status: varchar("status", { length: 20 })
    .notNull()
    .default("collected"), // collected, processed, disposed
}, (table) => {
  return {
    reportIdx: uniqueIndex("collected_wastes_report_idx").on(table.reportId),
  };
});

// Notifications table with optimized types
export const Notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id, { onDelete: "cascade" })
    .notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 30 }).notNull(), // Reduced length for type categories
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => {
  return {
    userIdx: uniqueIndex("notifications_user_idx").on(table.userId),
    createdAtIdx: uniqueIndex("notifications_created_at_idx").on(table.createdAt),
  };
});

// Transactions table with enum-like type
export const Transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 10 }) // Reduced length
    .notNull() // 'earned', 'redeemed'
    .$type<"earned" | "redeemed">(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  date: timestamp("date", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => {
  return {
    userIdx: uniqueIndex("transactions_user_idx").on(table.userId),
    dateIdx: uniqueIndex("transactions_date_idx").on(table.date),
  };
});