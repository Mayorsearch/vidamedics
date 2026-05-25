CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL UNIQUE,
	"full_name" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"contact_email" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"state" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD COLUMN "delivery_details_json" text DEFAULT '{}' NOT NULL;