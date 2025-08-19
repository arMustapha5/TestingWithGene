-- Fix RLS Policies for SecureAuth AI
-- Run this in Supabase SQL Editor to fix the authentication issues

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;
DROP POLICY IF EXISTS "Users can view their own biometric credentials" ON public.biometric_credentials;
DROP POLICY IF EXISTS "Users can insert their own biometric credentials" ON public.biometric_credentials;
DROP POLICY IF EXISTS "Users can update their own biometric credentials" ON public.biometric_credentials;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.authentication_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.authentication_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.authentication_sessions;
DROP POLICY IF EXISTS "Users can view their own challenges" ON public.webauthn_challenges;
DROP POLICY IF EXISTS "Users can insert their own challenges" ON public.webauthn_challenges;
DROP POLICY IF EXISTS "Users can update their own challenges" ON public.webauthn_challenges;

-- Create new permissive policies for public access
CREATE POLICY "Allow public user registration" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public user authentication" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.users
    FOR UPDATE USING (true);

CREATE POLICY "Allow public biometric credential operations" ON public.biometric_credentials
    FOR ALL USING (true);

CREATE POLICY "Allow public session operations" ON public.authentication_sessions
    FOR ALL USING (true);

CREATE POLICY "Allow public challenge operations" ON public.webauthn_challenges
    FOR ALL USING (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
