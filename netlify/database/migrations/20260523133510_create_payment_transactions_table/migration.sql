CREATE TABLE "payment_transactions" (
	"id" serial PRIMARY KEY,
	"reference" text NOT NULL UNIQUE,
	"gateway_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"items_json" text DEFAULT '[]' NOT NULL,
	"authorization_url" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
