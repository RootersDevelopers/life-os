CREATE TABLE "daily_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" text NOT NULL,
	"water" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"start" text NOT NULL,
	"end" text NOT NULL,
	"duration_min" integer DEFAULT 30 NOT NULL,
	"category" text DEFAULT 'General' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"mood" text DEFAULT '' NOT NULL,
	"energy" text DEFAULT '' NOT NULL,
	"color" text DEFAULT '#22c55e' NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'General' NOT NULL,
	"target" real NOT NULL,
	"current" real DEFAULT 0 NOT NULL,
	"unit" text DEFAULT '' NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"repeat" text DEFAULT 'Daily' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"habit_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"date" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"icon" text DEFAULT 'sparkles' NOT NULL,
	"color" text DEFAULT '#22c55e' NOT NULL,
	"target" integer DEFAULT 1 NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"meal_type" text DEFAULT 'Lunch' NOT NULL,
	"foods" text DEFAULT '' NOT NULL,
	"protein" integer DEFAULT 0 NOT NULL,
	"carbs" integer DEFAULT 0 NOT NULL,
	"fat" integer DEFAULT 0 NOT NULL,
	"calories" integer DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"date" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" text DEFAULT 'info' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'Water Reminder' NOT NULL,
	"repeat" text DEFAULT 'Every 2 Hours' NOT NULL,
	"start" text DEFAULT '08:00' NOT NULL,
	"end" text DEFAULT '22:00' NOT NULL,
	"channel" text DEFAULT 'Sound & Vibration' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" text DEFAULT 'expense' NOT NULL,
	"amount" real NOT NULL,
	"category" text DEFAULT 'Other' NOT NULL,
	"payment" text DEFAULT 'M-Pesa' NOT NULL,
	"date" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"plan" text DEFAULT 'Premium' NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text DEFAULT 'Cycling' NOT NULL,
	"date" text NOT NULL,
	"start" text DEFAULT '06:00' NOT NULL,
	"duration_min" integer DEFAULT 30 NOT NULL,
	"distance" real DEFAULT 0 NOT NULL,
	"speed" real DEFAULT 0 NOT NULL,
	"calories" integer DEFAULT 0 NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_stats_uniq" ON "daily_stats" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "habit_log_uniq" ON "habit_logs" USING btree ("habit_id","date");