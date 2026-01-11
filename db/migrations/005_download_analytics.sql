
-- Create download_logs table for analytics
CREATE TABLE IF NOT EXISTS "download_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ringtone_id" uuid REFERENCES "ringtones"("id") ON DELETE CASCADE,
	"user_id" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
    "ip_hash" text, 
	"created_at" timestamp with time zone DEFAULT now()
);

-- Index for fast time-range queries
CREATE INDEX "idx_download_logs_created_at" ON "download_logs" USING btree ("created_at");
CREATE INDEX "idx_download_logs_ringtone_id" ON "download_logs" USING btree ("ringtone_id");

-- Enable RLS
ALTER TABLE "download_logs" ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can view all
CREATE POLICY "Admins can view all logs" ON "download_logs" FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert policy (server-side only typically, but allowing authenticated/anon for the action)
CREATE POLICY "Anyone can insert logs" ON "download_logs" FOR INSERT WITH CHECK (true);
