import { supabase } from '@/integrations/supabase/client';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'];
type BiometricCredential = Database['public']['Tables']['biometric_credentials']['Row'];
type AuthSession = Database['public']['Tables']['auth_sessions']['Row'];

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  lastLogin: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export interface WebAuthnRegistrationOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  timeout: number;
  attestation: string;
  authenticatorSelection: {
    authenticatorAttachment: string;
    residentKey: string;
    userVerification: string;
  };
  excludeCredentials: Array<{
    type: string;
    id: string;
    transports: string[];
  }>;
}

export interface WebAuthnAuthenticationOptions {
  challenge: string;
  rpId: string;
  allowCredentials: Array<{
    type: string;
    id: string;
    transports: string[];
  }>;
  userVerification: string;
  timeout: number;
}

export interface FaceRegistrationOptions {
  // For demo: client captures image, we compute signature client-side
  method: 'ahash-8x8';
  threshold: number; // max Hamming distance allowed
}

export interface FaceAuthenticationOptions {
  method: 'ahash-8x8';
  threshold: number;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;
  private sessionToken: string | null = null;
  private isDatabaseReady: boolean = false;

  private constructor() {
    this.initializeAuth();
    this.checkDatabaseReady();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async checkDatabaseReady() {
    try {
      // Test if the users table exists
      const { error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });
      
      this.isDatabaseReady = !error;
      if (this.isDatabaseReady) {
        console.log('✅ Database is ready');
      } else {
        console.warn('⚠️ Database tables not ready yet. Please run the schema setup first.');
      }
    } catch (error) {
      console.warn('⚠️ Database check failed:', error);
      this.isDatabaseReady = false;
    }
  }

  private async initializeAuth() {
    // Check for existing session
    const session = localStorage.getItem('auth_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.expiresAt > Date.now()) {
          this.sessionToken = sessionData.token;
          await this.validateSession();
        } else {
          this.clearSession();
        }
      } catch (error) {
        this.clearSession();
      }
    }
  }

  private clearSession() {
    localStorage.removeItem('auth_session');
    this.sessionToken = null;
    this.currentUser = null;
  }

  private async validateSession() {
    if (!this.sessionToken || !this.isDatabaseReady) return false;

    try {
      const { data, error } = await supabase
        .from('authentication_sessions')
        .select('*, users(*)')
        .eq('session_token', this.sessionToken)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        this.clearSession();
        return false;
      }

      this.currentUser = {
        id: data.users.id,
        email: data.users.email,
        username: data.users.username,
        isActive: data.users.is_active,
        lastLogin: data.users.last_login,
      };

      return true;
    } catch (error) {
      this.clearSession();
      return false;
    }
  }

  // User Registration
  async register(credentials: RegisterCredentials): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (!this.isDatabaseReady) {
      return { 
        success: false, 
        error: 'Database is not ready. Please run the schema setup first. See SUPABASE_SETUP.md for instructions.' 
      };
    }

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', credentials.email)
        .single();

      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Hash password (in production, use proper hashing)
      const passwordHash = btoa(credentials.password); // Simple encoding for demo

      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email: credentials.email,
          username: credentials.username,
          password_hash: passwordHash,
          is_active: true,
          failed_attempts: 0,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        isActive: user.is_active,
        lastLogin: user.last_login,
      };

      return { success: true, user: authUser };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  }

  // Fetch user helpers
  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.isDatabaseReady) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      if (error || !data) return null;
      return data as unknown as User;
    } catch {
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    if (!this.isDatabaseReady) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      if (error || !data) return null;
      return data as unknown as User;
    } catch {
      return null;
    }
  }

  // Password-based Login
  async loginWithPassword(credentials: LoginCredentials): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (!this.isDatabaseReady) {
      return { 
        success: false, 
        error: 'Database is not ready. Please run the schema setup first. See SUPABASE_SETUP.md for instructions.' 
      };
    }

    try {
      // Get user
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.email)
        .single();

      if (error || !user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        return { success: false, error: 'Account is temporarily locked' };
      }

      // Verify password (in production, use proper verification)
      const passwordHash = btoa(credentials.password);
      if (user.password_hash !== passwordHash) {
        // Increment failed attempts
        const newFailedAttempts = user.failed_attempts + 1;
        const isLocked = newFailedAttempts >= 5;
        const lockedUntil = isLocked ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null; // 15 minutes

        await supabase
          .from('users')
          .update({
            failed_attempts: newFailedAttempts,
            locked_until: lockedUntil,
          })
          .eq('id', user.id);

        if (isLocked) {
          return { success: false, error: 'Account locked due to multiple failed attempts' };
        }

        return { success: false, error: 'Invalid credentials' };
      }

      // Reset failed attempts on successful login
      await supabase
        .from('users')
        .update({
          failed_attempts: 0,
          locked_until: null,
          last_login: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      await supabase
        .from('authentication_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt,
          is_active: true,
        });

      // Store session
      this.sessionToken = sessionToken;
      this.currentUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        isActive: user.is_active,
        lastLogin: new Date().toISOString(),
      };

      localStorage.setItem('auth_session', JSON.stringify({
        token: sessionToken,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      }));

      return { success: true, user: this.currentUser };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }

  // WebAuthn Registration
  async registerWebAuthn(userId: string): Promise<{ success: boolean; options?: WebAuthnRegistrationOptions; error?: string }> {
    if (!this.isDatabaseReady) {
      return { 
        success: false, 
        error: 'Database is not ready. Please run the schema setup first.' 
      };
    }

    try {
      // Generate challenge
      const challenge = this.generateChallenge();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      // Store challenge in database
      const { error: challengeError } = await supabase
        .from('webauthn_challenges')
        .insert({
          user_id: userId,
          challenge,
          challenge_type: 'registration',
          expires_at: expiresAt,
          is_used: false,
        });

      if (challengeError) {
        return { success: false, error: 'Failed to create challenge' };
      }

      // Get user info
      const { data: user } = await supabase
        .from('users')
        .select('username, email')
        .eq('id', userId)
        .single();

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const options: WebAuthnRegistrationOptions = {
        challenge,
        rp: {
          name: 'SecureAuth AI',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: user.email,
          displayName: user.username,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        timeout: 300000, // 5 minutes
        attestation: 'none',
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
        excludeCredentials: [],
      };

      return { success: true, options };
    } catch (error) {
      return { success: false, error: 'Failed to generate registration options' };
    }
  }

  // WebAuthn Registration Verification
  async verifyWebAuthnRegistration(
    userId: string,
    credential: any
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isDatabaseReady) {
      return { 
        success: false, 
        error: 'Database is not ready. Please run the schema setup first.' 
      };
    }

    try {
      // Get stored challenge
      const { data: challengeData, error: challengeError } = await supabase
        .from('webauthn_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_type', 'registration')
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (challengeError || !challengeData) {
        return { success: false, error: 'Invalid challenge' };
      }

      // Mark challenge as used
      await supabase
        .from('webauthn_challenges')
        .update({ is_used: true })
        .eq('id', challengeData.id);

      // Store credential in database
      const { error: credentialError } = await supabase
        .from('biometric_credentials')
        .insert({
          user_id: userId,
          credential_id: credential.id,
          public_key: JSON.stringify(credential.response),
          sign_count: 0,
          transports: credential.response.transports || ['internal'],
          is_active: true,
        });

      if (credentialError) {
        return { success: false, error: 'Failed to store credential' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration verification failed' };
    }
  }

  // WebAuthn Authentication
  async authenticateWebAuthn(userId: string): Promise<{ success: boolean; options?: WebAuthnAuthenticationOptions; error?: string }> {
    if (!this.isDatabaseReady) {
      return { 
        success: false, 
        error: 'Database is not ready. Please run the schema setup first.' 
      };
    }

    try {
      // Get user's credentials
      const { data: credentials, error: credentialsError } = await supabase
        .from('biometric_credentials')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (credentialsError || !credentials.length) {
        return { success: false, error: 'No biometric credentials found' };
      }

      // Generate challenge
      const challenge = this.generateChallenge();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      // Store challenge in database
      const { error: challengeError } = await supabase
        .from('webauthn_challenges')
        .insert({
          user_id: userId,
          challenge,
          challenge_type: 'authentication',
          expires_at: expiresAt,
          is_used: false,
        });

      if (challengeError) {
        return { success: false, error: 'Failed to create challenge' };
      }

      const options: WebAuthnAuthenticationOptions = {
        challenge,
        rpId: window.location.hostname,
        allowCredentials: credentials.map(cred => ({
          type: 'public-key',
          id: cred.credential_id,
          transports: cred.transports,
        })),
        userVerification: 'preferred',
        timeout: 300000, // 5 minutes
      };

      return { success: true, options };
    } catch (error) {
      return { success: false, error: 'Failed to generate authentication options' };
    }
  }

  // WebAuthn Authentication Verification
  async verifyWebAuthnAuthentication(
    userId: string,
    credential: any
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (!this.isDatabaseReady) {
      return { 
        success: false, 
        error: 'Database is not ready. Please run the schema setup first.' 
      };
    }

    try {
      // Get stored challenge
      const { data: challengeData, error: challengeError } = await supabase
        .from('webauthn_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_type', 'authentication')
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (challengeError || !challengeData) {
        return { success: false, error: 'Invalid challenge' };
      }

      // Mark challenge as used
      await supabase
        .from('webauthn_challenges')
        .update({ is_used: true })
        .eq('id', challengeData.id);

      // Update credential sign count
      await supabase
        .from('biometric_credentials')
        .update({
          sign_count: credential.response.signCount || 0,
          last_used: new Date().toISOString(),
        })
        .eq('credential_id', credential.id);

      // Get user info
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      await supabase
        .from('authentication_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          expires_at: expiresAt,
          is_active: true,
        });

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

      // Store session
      this.sessionToken = sessionToken;
      this.currentUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        isActive: user.is_active,
        lastLogin: new Date().toISOString(),
      };

      localStorage.setItem('auth_session', JSON.stringify({
        token: sessionToken,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      }));

      return { success: true, user: this.currentUser };
    } catch (error) {
      return { success: false, error: 'Authentication verification failed' };
    }
  }

  // Face recognition - options generation (simple, client-side processing)
  async registerFaceOptions(userId: string): Promise<{ success: boolean; options?: FaceRegistrationOptions; error?: string }> {
    if (!this.isDatabaseReady) {
      return { success: false, error: 'Database is not ready. Please run the schema setup first.' };
    }
    try {
      // Provide options for client-side capture/signature
      return { success: true, options: { method: 'ahash-8x8', threshold: 10 } };
    } catch {
      return { success: false, error: 'Failed to generate face registration options' };
    }
  }

  async verifyFaceRegistration(userId: string, faceSignature: string, modelVersion: string = 'ahash-8x8', threshold: number = 10): Promise<{ success: boolean; error?: string }> {
    if (!this.isDatabaseReady) {
      return { success: false, error: 'Database is not ready. Please run the schema setup first.' };
    }

    try {
      // Store face signature for the user
      const { error } = await supabase
        .from('face_credentials')
        .insert({
          user_id: userId,
          face_signature: faceSignature,
          model_version: modelVersion,
          threshold,
          is_active: true,
        });

      if (error) {
        return { success: false, error: 'Failed to store face credential' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Face registration failed' };
    }
  }

  async authenticateFaceOptions(userId: string): Promise<{ success: boolean; options?: FaceAuthenticationOptions; error?: string }> {
    if (!this.isDatabaseReady) {
      return { success: false, error: 'Database is not ready. Please run the schema setup first.' };
    }
    try {
      // Ensure user has active face credential
      const { data, error } = await supabase
        .from('face_credentials')
        .select('id, threshold')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1);
      if (error || !data || data.length === 0) {
        return { success: false, error: 'No face credentials found' };
      }
      return { success: true, options: { method: 'ahash-8x8', threshold: data[0].threshold ?? 10 } };
    } catch {
      return { success: false, error: 'Failed to prepare face authentication' };
    }
  }

  async verifyFaceAuthentication(userId: string, candidateSignature: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (!this.isDatabaseReady) {
      return { success: false, error: 'Database is not ready. Please run the schema setup first.' };
    }
    try {
      // Fetch stored signatures
      const { data: creds, error } = await supabase
        .from('face_credentials')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);
      if (error || !creds || creds.length === 0) {
        return { success: false, error: 'No face credentials found' };
      }

      // Compare using Hamming distance on hex strings
      const isMatch = creds.some(c => this.hammingDistanceHex(c.face_signature, candidateSignature) <= (c.threshold ?? 10));
      if (!isMatch) {
        return { success: false, error: 'Face not recognized' };
      }

      // Update last used
      await supabase
        .from('face_credentials')
        .update({ last_used: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Get user and create session
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (!user) return { success: false, error: 'User not found' };

      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from('authentication_sessions')
        .insert({ user_id: userId, session_token: sessionToken, expires_at: expiresAt, is_active: true });

      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

      this.sessionToken = sessionToken;
      this.currentUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        isActive: user.is_active,
        lastLogin: new Date().toISOString(),
      };
      localStorage.setItem('auth_session', JSON.stringify({ token: sessionToken, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }));

      return { success: true, user: this.currentUser };
    } catch {
      return { success: false, error: 'Face authentication failed' };
    }
  }

  async hasFaceCredentials(userId: string): Promise<boolean> {
    if (!this.isDatabaseReady) return false;
    try {
      const { data, error } = await supabase
        .from('face_credentials')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1);
      return !error && !!data && data.length > 0;
    } catch {
      return false;
    }
  }

  // Hamming distance for equal-length hex strings
  private hammingDistanceHex(a: string, b: string): number {
    if (!a || !b || a.length !== b.length) return Number.MAX_SAFE_INTEGER;
    let distance = 0;
    for (let i = 0; i < a.length; i++) {
      const x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
      // count set bits in 4-bit value
      distance += (x & 1) + ((x >> 1) & 1) + ((x >> 2) & 1) + ((x >> 3) & 1);
    }
    return distance;
  }

  // Check if user has biometric credentials
  async hasBiometricCredentials(userId: string): Promise<boolean> {
    if (!this.isDatabaseReady) return false;

    try {
      const { data, error } = await supabase
        .from('biometric_credentials')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1);

      return !error && data && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Logout
  async logout(): Promise<void> {
    if (this.sessionToken && this.isDatabaseReady) {
      // Mark session as inactive
      await supabase
        .from('authentication_sessions')
        .update({ is_active: false })
        .eq('session_token', this.sessionToken);
    }

    this.clearSession();
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.sessionToken !== null;
  }

  // Check if database is ready
  isDatabaseReady(): boolean {
    return this.isDatabaseReady;
  }

  // Generate session token
  private generateSessionToken(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Generate challenge
  private generateChallenge(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }
}

export const authService = AuthService.getInstance();
