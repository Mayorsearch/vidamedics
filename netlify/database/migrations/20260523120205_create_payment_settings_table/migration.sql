CREATE TABLE "payment_settings" (
	"id" serial PRIMARY KEY,
	"gateway_name" text NOT NULL,
	"public_key" text DEFAULT '' NOT NULL,
	"secret_key" text DEFAULT '' NOT NULL,
	"webhook_secret" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
