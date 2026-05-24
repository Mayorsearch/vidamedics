CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"recipient_email" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
