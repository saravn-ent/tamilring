-- Migration to add missing columns and tables for acoustic fingerprinting and content localization

-- 1. Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS "artist_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artist_name" text NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "artist_images_artist_name_unique" UNIQUE("artist_name")
);

CREATE TABLE IF NOT EXISTS "deity_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deity_name" text NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "deity_images_deity_name_unique" UNIQUE("deity_name")
);

-- 2. Add missing columns to ringtones table
ALTER TABLE "ringtones" ADD COLUMN IF NOT EXISTS "lyricist" text;
ALTER TABLE "ringtones" ADD COLUMN IF NOT EXISTS "language" text DEFAULT 'tamil' NOT NULL;
ALTER TABLE "ringtones" ADD COLUMN IF NOT EXISTS "audio_hash" text;
ALTER TABLE "ringtones" ADD COLUMN IF NOT EXISTS "acoustic_fingerprint" text;
ALTER TABLE "ringtones" ADD COLUMN IF NOT EXISTS "is_suspected_duplicate" boolean DEFAULT false;
ALTER TABLE "ringtones" ADD COLUMN IF NOT EXISTS "duplicate_reason" text;

-- 3. Reload PostgREST schema cache (Supabase specific)
NOTIFY pgrst, 'reload schema';
