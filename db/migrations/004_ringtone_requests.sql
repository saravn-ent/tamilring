CREATE TABLE "ringtone_requests" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "movie_name" text NOT NULL,
    "song_name" text NOT NULL,
    "description" text,
    "status" text DEFAULT 'pending' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE "ringtone_requests" ADD CONSTRAINT "ringtone_requests_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "ringtone_requests" ENABLE ROW LEVEL SECURITY;

-- Everyone can view requests
CREATE POLICY "Requests are viewable by everyone" ON "ringtone_requests" FOR SELECT USING (true);

-- Authenticated users can create requests
CREATE POLICY "Users can create requests" ON "ringtone_requests" FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update/delete their own pending requests
CREATE POLICY "Users can manage own requests" ON "ringtone_requests" FOR ALL USING (auth.uid() = user_id AND status = 'pending');

-- Admins can manage everything
CREATE POLICY "Admins can manage all requests" ON "ringtone_requests" FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_ringtone_requests_modtime BEFORE UPDATE ON "ringtone_requests" FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
