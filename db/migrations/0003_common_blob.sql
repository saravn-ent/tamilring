CREATE TABLE "search_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" text NOT NULL,
	"normalized_query" text NOT NULL,
	"user_id" uuid,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "is_first_upload_rewarded" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "total_withdrawn_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "search_logs" ADD CONSTRAINT "search_logs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_search_logs_normalized_time" ON "search_logs" USING btree ("normalized_query","created_at");

-- Enable RLS
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert logs
CREATE POLICY "Enable insert for all users" 
ON search_logs FOR INSERT 
TO public 
WITH CHECK (true);

-- Secure RPC function to calculate trending tags without exposing raw logs
CREATE OR REPLACE FUNCTION get_trending_search_tags(limit_count INT DEFAULT 10)
RETURNS TABLE (tag TEXT, score BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (admin)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        normalized_query as tag,
        COUNT(DISTINCT ip_hash) as score
    FROM search_logs
    WHERE created_at > (now() - INTERVAL '7 days')
    GROUP BY normalized_query
    HAVING COUNT(DISTINCT ip_hash) > 1 -- Optional: minimal threshold
    ORDER BY score DESC
    LIMIT limit_count;
END;
$$;