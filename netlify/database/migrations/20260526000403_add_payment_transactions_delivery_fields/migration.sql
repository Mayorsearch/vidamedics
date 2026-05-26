ALTER TABLE "payment_transactions" ADD COLUMN "delivery_full_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD COLUMN "delivery_phone" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD COLUMN "delivery_address" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD COLUMN "delivery_city" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD COLUMN "delivery_state" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD COLUMN "delivery_notes" text DEFAULT '' NOT NULL;