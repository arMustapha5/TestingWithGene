-- SecureAuth AI Database Schema
-- AI-Enhanced Bioauthentication System

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE
);

-- Biometric credentials table
CREATE TABLE IF NOT EXISTS public.biometric_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    sign_count BIGINT DEFAULT 0,
    transports TEXT[] DEFAULT ARRAY['internal'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Authentication sessions table
CREATE TABLE IF NOT EXISTS public.authentication_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    ip_address INET,
    user_agent TEXT
);

-- WebAuthn challenges table
CREATE TABLE IF NOT EXISTS public.webauthn_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    challenge TEXT NOT NULL,
    challenge_type TEXT NOT NULL CHECK (challenge_type IN ('registration', 'authentication')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);

CREATE INDEX IF NOT EXISTS idx_biometric_credentials_user_id ON public.biometric_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_biometric_credentials_credential_id ON public.biometric_credentials(credential_id);
CREATE INDEX IF NOT EXISTS idx_biometric_credentials_active ON public.biometric_credentials(is_active);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON public.authentication_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON public.authentication_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_active ON public.authentication_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON public.authentication_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_user_id ON public.webauthn_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_type ON public.webauthn_challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_used ON public.webauthn_challenges(is_used);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_expires ON public.webauthn_challenges(expires_at);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authentication_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

-- Users policies - Allow public access for registration and authentication
CREATE POLICY "Allow public user registration" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public user authentication" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.users
    FOR UPDATE USING (true);

-- Biometric credentials policies - Allow public access for WebAuthn operations
CREATE POLICY "Allow public biometric credential operations" ON public.biometric_credentials
    FOR ALL USING (true);

-- Authentication sessions policies - Allow public access for session management
CREATE POLICY "Allow public session operations" ON public.authentication_sessions
    FOR ALL USING (true);

-- WebAuthn challenges policies - Allow public access for challenge management
CREATE POLICY "Allow public challenge operations" ON public.webauthn_challenges
    FOR ALL USING (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.authentication_sessions 
    WHERE expires_at < NOW() OR is_active = false;
    
    DELETE FROM public.webauthn_challenges 
    WHERE expires_at < NOW() OR is_used = true;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired challenges
CREATE OR REPLACE FUNCTION cleanup_expired_challenges()
RETURNS void AS $$
BEGIN
    DELETE FROM public.webauthn_challenges 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user with biometric credentials
CREATE OR REPLACE FUNCTION get_user_with_biometrics(user_email TEXT)
RETURNS TABLE(
    id UUID,
    email VARCHAR(255),
    username VARCHAR(100),
    has_biometric BOOLEAN,
    biometric_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.username,
        CASE WHEN COUNT(bc.id) > 0 THEN true ELSE false END as has_biometric,
        COUNT(bc.id) as biometric_count
    FROM public.users u
    LEFT JOIN public.biometric_credentials bc ON u.id = bc.user_id AND bc.is_active = true
    WHERE u.email = user_email
    GROUP BY u.id, u.email, u.username;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is locked
CREATE OR REPLACE FUNCTION is_user_locked(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    locked BOOLEAN := false;
BEGIN
    SELECT 
        CASE 
            WHEN locked_until IS NOT NULL AND locked_until > NOW() THEN true
            ELSE false
        END INTO locked
    FROM public.users 
    WHERE email = user_email;
    
    RETURN COALESCE(locked, false);
END;
$$ LANGUAGE plpgsql;

-- Function to increment failed attempts
CREATE OR REPLACE FUNCTION increment_failed_attempts(user_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.users 
    SET 
        failed_attempts = failed_attempts + 1,
        locked_until = CASE 
            WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
            ELSE locked_until
        END
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Function to reset failed attempts
CREATE OR REPLACE FUNCTION reset_failed_attempts(user_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.users 
    SET 
        failed_attempts = 0,
        locked_until = NULL,
        last_login = NOW()
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing (optional)
-- INSERT INTO public.users (email, username, password_hash, is_active) VALUES
--     ('test@example.com', 'testuser', 'dGVzdHBhc3N3b3Jk', true),
--     ('demo@example.com', 'demouser', 'ZGVtb3Bhc3N3b3Jk', true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create a view for user authentication status
CREATE OR REPLACE VIEW public.user_auth_status AS
SELECT 
    u.id,
    u.email,
    u.username,
    u.is_active,
    u.failed_attempts,
    u.locked_until,
    u.last_login,
    COUNT(bc.id) as biometric_credential_count,
    CASE 
        WHEN COUNT(bc.id) > 0 THEN true 
        ELSE false 
    END as has_biometric_credentials,
    CASE 
        WHEN u.locked_until IS NOT NULL AND u.locked_until > NOW() THEN true
        ELSE false
    END as is_locked
FROM public.users u
LEFT JOIN public.biometric_credentials bc ON u.id = bc.user_id AND bc.is_active = true
GROUP BY u.id, u.email, u.username, u.is_active, u.failed_attempts, u.locked_until, u.last_login;

-- Grant access to the view
GRANT SELECT ON public.user_auth_status TO anon, authenticated;
