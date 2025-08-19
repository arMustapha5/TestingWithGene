import express from 'express';
import cors from 'cors';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { randomBytes } from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo purposes (use database in production)
const users = new Map();
const challenges = new Map();

// WebAuthn configuration
const rpName = 'SecureAuth AI';
const rpID = 'localhost';
const origin = `https://${rpID}:${PORT}`;

// Generate registration options
app.post('/api/webauthn/register/options', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: username,
      userName: username,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    });

    // Store challenge
    challenges.set(username, options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Registration options error:', error);
    res.status(500).json({ error: 'Failed to generate registration options' });
  }
});

// Verify registration
app.post('/api/webauthn/register/verify', async (req, res) => {
  try {
    const { username, response } = req.body;
    
    if (!username || !response) {
      return res.status(400).json({ error: 'Username and response are required' });
    }

    const expectedChallenge = challenges.get(username);
    if (!expectedChallenge) {
      return res.status(400).json({ error: 'No challenge found for user' });
    }

    // Verify registration response
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified) {
      // Store user credentials
      users.set(username, {
        id: username,
        credentials: [verification.registrationInfo],
        registeredAt: new Date(),
      });
      
      challenges.delete(username);
      
      res.json({ 
        success: true, 
        message: 'Registration successful',
        user: { username, registeredAt: new Date() }
      });
    } else {
      res.status(400).json({ error: 'Registration verification failed' });
    }
  } catch (error) {
    console.error('Registration verification error:', error);
    res.status(500).json({ error: 'Failed to verify registration' });
  }
});

// Generate authentication options
app.post('/api/webauthn/authenticate/options', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = users.get(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.credentials.map(cred => ({
        id: cred.credentialID,
        type: 'public-key',
        transports: cred.transports || ['internal'],
      })),
      userVerification: 'preferred',
    });

    // Store challenge
    challenges.set(username, options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Authentication options error:', error);
    res.status(500).json({ error: 'Failed to generate authentication options' });
  }
});

// Verify authentication
app.post('/api/webauthn/authenticate/verify', async (req, res) => {
  try {
    const { username, response } = req.body;
    
    if (!username || !response) {
      return res.status(400).json({ error: 'Username and response are required' });
    }

    const user = users.get(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const expectedChallenge = challenges.get(username);
    if (!expectedChallenge) {
      return res.status(400).json({ error: 'No challenge found for user' });
    }

    // Find the credential
    const credential = user.credentials.find(cred => 
      isoBase64URL.fromBuffer(cred.credentialID) === response.id
    );

    if (!credential) {
      return res.status(400).json({ error: 'Credential not found' });
    }

    // Verify authentication response
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: credential,
    });

    if (verification.verified) {
      challenges.delete(username);
      
      res.json({ 
        success: true, 
        message: 'Authentication successful',
        user: { username, authenticatedAt: new Date() }
      });
    } else {
      res.status(400).json({ error: 'Authentication verification failed' });
    }
  } catch (error) {
    console.error('Authentication verification error:', error);
    res.status(500).json({ error: 'Failed to verify authentication' });
  }
});

// Simulated biometric endpoints for fallback testing
app.post('/api/auth/fingerprint', async (req, res) => {
  try {
    const { userId, biometricData } = req.body;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success/failure based on data
    const success = biometricData && biometricData.includes('fingerprint');
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Fingerprint authentication successful',
        method: 'fingerprint'
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Invalid fingerprint data',
        method: 'fingerprint'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fingerprint authentication failed' });
  }
});

app.post('/api/auth/face', async (req, res) => {
  try {
    const { userId, biometricData } = req.body;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success/failure based on data
    const success = biometricData && biometricData.includes('face');
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Face ID authentication successful',
        method: 'face'
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Invalid face data',
        method: 'face'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Face ID authentication failed' });
  }
});

// User management endpoints
app.get('/api/users', (req, res) => {
  const userList = Array.from(users.values()).map(user => ({
    id: user.id,
    registeredAt: user.registeredAt,
    credentialCount: user.credentials.length,
  }));
  res.json(userList);
});

app.delete('/api/users/:username', (req, res) => {
  const { username } = req.params;
  if (users.has(username)) {
    users.delete(username);
    challenges.delete(username);
    res.json({ message: 'User deleted successfully' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    userCount: users.size,
    activeChallenges: challenges.size
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SecureAuth AI Backend Server running on port ${PORT}`);
  console.log(`📱 WebAuthn RP ID: ${rpID}`);
  console.log(`🌐 Origin: ${origin}`);
  console.log(`🔐 Ready for bioauthentication testing`);
});

export default app;
