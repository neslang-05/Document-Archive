-- Add support for multiple files per resource
-- Run this in Supabase SQL Editor

-- Create resource_files table for multiple file attachments
CREATE TABLE IF NOT EXISTS resource_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    file_type TEXT NOT NULL,
    file_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_resource_files_resource_id ON resource_files(resource_id);
CREATE INDEX idx_resource_files_order ON resource_files(resource_id, file_order);

-- Enable RLS
ALTER TABLE resource_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for resource_files
-- View files if you can view the resource
CREATE POLICY "Files viewable if resource viewable"
    ON resource_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM resources 
            WHERE resources.id = resource_files.resource_id 
            AND (
                resources.status = 'approved' 
                OR resources.uploader_id = auth.uid() 
                OR get_user_role(auth.uid()) IN ('moderator', 'admin')
            )
        )
    );

-- Insert files if you can insert the resource
CREATE POLICY "Users can insert own resource files"
    ON resource_files FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM resources 
            WHERE resources.id = resource_files.resource_id 
            AND resources.uploader_id = auth.uid()
        )
    );

-- Delete files if you own the resource or are moderator/admin
CREATE POLICY "Users can delete own resource files"
    ON resource_files FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM resources 
            WHERE resources.id = resource_files.resource_id 
            AND (
                resources.uploader_id = auth.uid()
                OR get_user_role(auth.uid()) IN ('moderator', 'admin')
            )
        )
    );

-- Migrate existing single-file resources to the new structure
-- This will copy the existing file_url, file_name, file_size, file_type from resources to resource_files
INSERT INTO resource_files (resource_id, file_url, file_name, file_size, file_type, file_order)
SELECT id, file_url, file_name, file_size, file_type, 0
FROM resources
WHERE file_url IS NOT NULL AND file_url != ''
ON CONFLICT DO NOTHING;

-- Note: We're keeping the original columns in resources table for backward compatibility
-- The file_url, file_name, file_size, file_type in resources will now represent the "primary" file
