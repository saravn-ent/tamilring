CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon_name" text NOT NULL,
	"condition_type" text NOT NULL,
	"condition_value" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "badges_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"role" text DEFAULT 'user',
	"bio" text,
	"website_url" text,
	"instagram_handle" text,
	"twitter_handle" text,
	"upi_id" text,
	"btc_address" text,
	"points" integer DEFAULT 0,
	"level" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ringtones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"movie_name" text,
	"movie_year" text,
	"singers" text,
	"music_director" text,
	"movie_director" text,
	"cast_members" text,
	"mood" text,
	"tags" text[],
	"poster_url" text,
	"backdrop_url" text,
	"audio_url" text NOT NULL,
	"audio_url_iphone" text,
	"waveform_url" text,
	"spotify_link" text,
	"apple_music_link" text,
	"downloads" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"status" text DEFAULT 'pending',
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ringtones_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"badge_id" uuid NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unique_user_badge" UNIQUE("user_id","badge_id")
);
--> statement-breakpoint
ALTER TABLE "ringtones" ADD CONSTRAINT "ringtones_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ringtones_slug" ON "ringtones" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_ringtones_user_id" ON "ringtones" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ringtones_status" ON "ringtones" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ringtones_created_at" ON "ringtones" USING btree ("created_at");

--> statement-breakpoint
-- RLS POLICIES
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ringtones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "badges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_badges" ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON "profiles" FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON "profiles" FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON "profiles" FOR UPDATE USING (auth.uid() = id);

-- Ringtones Policies
CREATE POLICY "Approved ringtones are viewable by everyone" ON "ringtones" FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Users can upload ringtones" ON "ringtones" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ringtones" ON "ringtones" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update everything" ON "ringtones" FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can delete own ringtones" ON "ringtones" FOR DELETE USING (auth.uid() = user_id);

-- Badges Policies
CREATE POLICY "Badges are viewable by everyone" ON "badges" FOR SELECT USING (true);
CREATE POLICY "User badges are viewable by everyone" ON "user_badges" FOR SELECT USING (true);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON "profiles" FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_ringtones_modtime BEFORE UPDATE ON "ringtones" FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- SEED INITIAL DATA
INSERT INTO "badges" ("name", "description", "icon_name", "condition_type", "condition_value") VALUES 
('First Cut', 'Uploaded your first ringtone', 'scissors', 'uploads_count', 1),
('Rising Star', 'Uploaded 10 approved ringtones', 'zap', 'uploads_count', 10),
('Trendsetter', 'Uploaded 50 approved ringtones', 'crown', 'uploads_count', 50),
('Community Loved', 'Received 100 total likes', 'heart', 'likes_received_count', 100)
ON CONFLICT ("name") DO NOTHING;