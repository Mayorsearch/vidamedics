import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial().primaryKey(),
  name: text().notNull(),
  description: text().notNull().default(""),
  shortDescription: text("short_description").notNull().default(""),
  price: integer().notNull(),
  imageUrl: text("image_url").notNull().default("/placeholder.png"),
  category: text().notNull().default("General"),
  inStock: boolean("in_stock").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentSettings = pgTable("payment_settings", {
  id: serial().primaryKey(),
  gatewayName: text("gateway_name").notNull(),
  publicKey: text("public_key").notNull().default(""),
  secretKey: text("secret_key").notNull().default(""),
  webhookSecret: text("webhook_secret").notNull().default(""),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentTransactions = pgTable("payment_transactions", {
  id: serial().primaryKey(),
  reference: text().notNull().unique(),
  gatewayName: text("gateway_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  amount: integer().notNull(),
  currency: text().notNull().default("NGN"),
  status: text().notNull().default("pending"),
  itemsJson: text("items_json").notNull().default("[]"),
  authorizationUrl: text("authorization_url").notNull().default(""),
  deliveryFullName: text("delivery_full_name").notNull().default(""),
  deliveryPhone: text("delivery_phone").notNull().default(""),
  deliveryAddress: text("delivery_address").notNull().default(""),
  deliveryCity: text("delivery_city").notNull().default(""),
  deliveryState: text("delivery_state").notNull().default(""),
  deliveryNotes: text("delivery_notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial().primaryKey(),
  type: text().notNull(),
  title: text().notNull(),
  message: text().notNull(),
  recipientEmail: text("recipient_email").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
