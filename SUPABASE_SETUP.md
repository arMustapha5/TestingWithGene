# 🔒 Supabase Database Setup Guide

## Overview

This guide will help you set up the Supabase database for the SecureAuth AI bioauthentication system. The database will store user accounts, biometric credentials, authentication sessions, and WebAuthn challenges in real-time.

## Prerequisites

- Supabase account and project
- Access to Supabase Dashboard
- Basic knowledge of SQL

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `secureauth-ai` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (usually takes 2-3 minutes)

## Step 2: Get Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://[project-id].supabase.co`
   - **Anon/Public Key**: `eyJ...` (starts with eyJ)
   - **Service Role Key**: `eyJ...` (starts with eyJ)

3. Update your `.env` file with these values:

```bash
# .env
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

## Step 3: Set Up Database Schema

### Option A: Using SQL Editor (Recommended)

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run" to execute the schema

### Option B: Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref [your-project-id]
```

4. Apply the schema:
```bash
supabase db push
```

## Step 4: Verify Database Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see the following tables:
   - `users`
   - `biometric_credentials`
   - `authentication_sessions`
   - `webauthn_challenges`

3. Check that the views are created:
   - `user_auth_status`

## Step 5: Configure Row Level Security (RLS)

The schema automatically enables RLS and creates policies. Verify these are working:

1. Go to **Authentication** → **Policies**
2. Check that each table has the appropriate policies
3. Ensure RLS is enabled for all tables

## Step 6: Test Database Connection

1. Start your application
2. Try to register a new user
3. Check the Supabase dashboard to see if the user was created
4. Verify that the user appears in the `users` table

## Database Schema Details

### Tables

#### `users`
- **id**: Unique identifier (UUID)
- **email**: User's email address (unique)
- **username**: User's username (unique)
- **password_hash**: Hashed password (for fallback authentication)
- **created_at**: Account creation timestamp
- **updated_at**: Last update timestamp
- **last_login**: Last login timestamp
- **is_active**: Account status
- **failed_attempts**: Number of failed login attempts
- **locked_until**: Account lockout timestamp

#### `biometric_credentials`
- **id**: Unique identifier (UUID)
- **user_id**: Reference to user (foreign key)
- **credential_id**: WebAuthn credential ID
- **public_key**: WebAuthn public key data
- **sign_count**: Signature counter for replay protection
- **transports**: Supported transport methods
- **created_at**: Credential creation timestamp
- **last_used**: Last usage timestamp
- **is_active**: Credential status

#### `authentication_sessions`
- **id**: Unique identifier (UUID)
- **user_id**: Reference to user (foreign key)
- **session_token**: Unique session token
- **created_at**: Session creation timestamp
- **expires_at**: Session expiration timestamp
- **is_active**: Session status
- **ip_address**: Client IP address
- **user_agent**: Client user agent

#### `webauthn_challenges`
- **id**: Unique identifier (UUID)
- **user_id**: Reference to user (foreign key)
- **challenge**: WebAuthn challenge string
- **challenge_type**: Type of challenge (registration/authentication)
- **created_at**: Challenge creation timestamp
- **expires_at**: Challenge expiration timestamp
- **is_used**: Whether challenge has been used

### Views

#### `user_auth_status`
Provides a comprehensive view of user authentication status including:
- Basic user information
- Biometric credential count
- Account lockout status
- Last login information

### Functions

#### `cleanup_expired_sessions()`
Automatically removes expired sessions and challenges

#### `cleanup_expired_challenges()`
Removes expired WebAuthn challenges

#### `get_user_with_biometrics(user_email)`
Returns user information with biometric credential status

#### `is_user_locked(user_email)`
Checks if a user account is currently locked

#### `increment_failed_attempts(user_email)`
Increments failed login attempts and locks account if threshold is reached

#### `reset_failed_attempts(user_email)`
Resets failed attempts and unlocks account on successful login

## Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Automatic data isolation between users
- Secure by default

### Password Security
- Passwords are hashed before storage
- Account lockout after multiple failed attempts
- Configurable lockout duration

### Session Management
- Secure session tokens
- Automatic session expiration
- IP address and user agent tracking

### WebAuthn Security
- Challenge-response authentication
- Replay attack protection
- Secure credential storage

## Monitoring and Maintenance

### Database Health Checks
1. Monitor table sizes and growth
2. Check for expired sessions and challenges
3. Review failed authentication attempts

### Performance Optimization
1. Monitor query performance
2. Check index usage
3. Optimize slow queries

### Security Monitoring
1. Review authentication logs
2. Monitor failed login attempts
3. Check for suspicious activity

## Troubleshooting

### Common Issues

#### 1. RLS Policies Not Working
- Ensure RLS is enabled on all tables
- Check that policies are correctly configured
- Verify user authentication status

#### 2. WebAuthn Challenges Expiring
- Check challenge expiration settings
- Verify timezone configurations
- Monitor challenge cleanup functions

#### 3. Session Management Issues
- Check session expiration settings
- Verify cleanup functions are running
- Monitor session table growth

#### 4. Biometric Credential Problems
- Verify credential storage format
- Check transport method support
- Monitor credential validation

### Debug Queries

#### Check User Status
```sql
SELECT * FROM user_auth_status WHERE email = 'user@example.com';
```

#### Check Active Sessions
```sql
SELECT * FROM authentication_sessions WHERE is_active = true;
```

#### Check Biometric Credentials
```sql
SELECT * FROM biometric_credentials WHERE user_id = 'user-uuid';
```

#### Check WebAuthn Challenges
```sql
SELECT * FROM webauthn_challenges WHERE is_used = false;
```

## Production Considerations

### Environment Variables
- Use strong, unique passwords
- Rotate keys regularly
- Secure environment variable storage

### Database Backups
- Enable automatic backups
- Test restore procedures
- Monitor backup success rates

### Performance Monitoring
- Set up database monitoring
- Configure alerting for issues
- Monitor query performance

### Security Hardening
- Regular security audits
- Update dependencies
- Monitor for vulnerabilities

## Support

If you encounter issues:

1. Check the Supabase documentation
2. Review the error logs in Supabase dashboard
3. Verify your schema matches the provided SQL
4. Test with a fresh database instance

## Next Steps

After setting up the database:

1. Test user registration and login
2. Verify biometric credential registration
3. Test WebAuthn authentication flow
4. Monitor database performance
5. Set up monitoring and alerting

---

**🎉 Your Supabase database is now ready for real-time bioauthentication!**

The system will automatically handle:
- User account management
- Biometric credential storage
- Secure session management
- WebAuthn challenge verification
- Account security and lockout protection
