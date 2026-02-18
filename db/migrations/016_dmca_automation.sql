-- Create a type for DMCA request status
CREATE TYPE dmca_status AS ENUM ('pending', 'approved', 'rejected');

-- Create a table for DMCA requests
CREATE TABLE dmca_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    work_description TEXT NOT NULL,
    infringing_urls TEXT NOT NULL,
    good_faith BOOLEAN NOT NULL DEFAULT FALSE,
    accurate BOOLEAN NOT NULL DEFAULT FALSE,
    status dmca_status DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE dmca_requests ENABLE ROW LEVEL SECURITY;

-- Allow public to insert DMCA requests (anyone can file a report)
CREATE POLICY "Enable insert for everyone" ON dmca_requests
    FOR INSERT WITH CHECK (true);

-- Allow admins to view all requests
-- Assuming admin checks are done via service role or admin profile check
CREATE POLICY "Enable select for admins" ON dmca_requests
    FOR SELECT USING (
        auth.role() = 'service_role' OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to update requests (e.g., change status)
CREATE POLICY "Enable update for admins" ON dmca_requests
    FOR UPDATE USING (
        auth.role() = 'service_role' OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Add index on status for faster filtering
CREATE INDEX idx_dmca_status ON dmca_requests(status);
