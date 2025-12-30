-- Fix RLS policies for resources and profiles tables
-- Run this in Supabase SQL Editor

-- ============================================
-- FIX PROFILES UPDATE POLICY (Allow admins to update any profile)
-- ============================================
-- Drop the old policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create updated policy that allows users to update their own profile OR admins to update any profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (
        auth.uid() = id 
        OR get_user_role(auth.uid()) = 'admin'
    );

-- ============================================
-- FIX SELECT POLICY FOR RESOURCES
-- ============================================
-- Drop the old policy
DROP POLICY IF EXISTS "Approved resources are viewable by everyone" ON resources;

-- Create updated policy that includes both moderator AND admin
CREATE POLICY "Approved resources are viewable by everyone"
    ON resources FOR SELECT
    USING (
        status = 'approved' 
        OR uploader_id = auth.uid() 
        OR get_user_role(auth.uid()) IN ('moderator', 'admin')
    );

-- ============================================
-- FIX UPDATE POLICY (This was missing admin!)
-- ============================================
-- Drop the old update policy
DROP POLICY IF EXISTS "Users can update own pending resources" ON resources;

-- Create updated policy that includes both moderator AND admin
CREATE POLICY "Users can update own pending resources"
    ON resources FOR UPDATE
    USING (
        (uploader_id = auth.uid() AND status = 'pending')
        OR get_user_role(auth.uid()) IN ('moderator', 'admin')
    );

-- ============================================
-- FIX DELETE POLICY (This was also missing admin!)
-- ============================================
-- Drop the old delete policy
DROP POLICY IF EXISTS "Users can delete own pending resources" ON resources;

-- Create updated policy that includes both moderator AND admin
CREATE POLICY "Users can delete own pending resources"
    ON resources FOR DELETE
    USING (
        (uploader_id = auth.uid() AND status = 'pending')
        OR get_user_role(auth.uid()) IN ('moderator', 'admin')
    );
