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
  customerName: text("customer_name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  city: text("city").notNull().default(""),
  state: text("state").notNull().default(""),
  postalCode: text("postal_code").notNull().default(""),
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
