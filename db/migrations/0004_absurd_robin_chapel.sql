CREATE TABLE "artist_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artist_name" text NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "artist_images_artist_name_unique" UNIQUE("artist_name")
);
--> statement-breakpoint
CREATE TABLE "deity_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deity_name" text NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "deity_images_deity_name_unique" UNIQUE("deity_name")
);
--> statement-breakpoint
ALTER TABLE "ringtones" ADD COLUMN "lyricist" text;--> statement-breakpoint
ALTER TABLE "ringtones" ADD COLUMN "language" text DEFAULT 'tamil' NOT NULL;--> statement-breakpoint
ALTER TABLE "ringtones" ADD COLUMN "audio_hash" text;--> statement-breakpoint
ALTER TABLE "ringtones" ADD COLUMN "acoustic_fingerprint" text;--> statement-breakpoint
ALTER TABLE "ringtones" ADD COLUMN "is_suspected_duplicate" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "ringtones" ADD COLUMN "duplicate_reason" text;