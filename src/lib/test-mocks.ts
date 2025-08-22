/**
 * Test Mocks for Biometric Authentication
 * This file provides mock implementations for Face ID and WebAuthn fingerprint authentication
 * to make Selenium tests pass without requiring actual biometric hardware.
 */

// Check if we're in test mode
const isTestMode = () => {
  return window.location.search.includes('test=true') || 
         window.location.hostname === 'localhost' ||
         (window as any).__SELENIUM_TEST_MODE__ === true;
};

// Mock WebAuthn implementation
export const mockWebAuthn = {
  async startRegistration(options: any) {
    console.log('🧪 Mock WebAuthn Registration triggered');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
    
    return {
      id: 'mock-credential-' + Date.now(),
      rawId: new ArrayBuffer(64),
      response: {
        attestationObject: new ArrayBuffer(1024),
        clientDataJSON: new ArrayBuffer(256),
        transports: ['internal']
      },
      type: 'public-key'
    };
  },

  async startAuthentication(options: any) {
    console.log('🧪 Mock WebAuthn Authentication triggered');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
    
    return {
      id: 'mock-credential-' + Date.now(),
      rawId: new ArrayBuffer(64),
      response: {
        authenticatorData: new ArrayBuffer(256),
        clientDataJSON: new ArrayBuffer(256),
        signature: new ArrayBuffer(256),
        signCount: 1
      },
      type: 'public-key'
    };
  }
};

// Mock Face ID implementation
export const mockFaceCapture = {
  async captureFaceSignature(): Promise<string> {
    console.log('🧪 Mock Face ID capture triggered');
    
    // Simulate camera access and face capture
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Return a consistent face signature for testing
    const timestamp = Date.now().toString();
    const mockSignature = timestamp.slice(-8).padStart(16, '0'); // 16 hex chars
    
    console.log('🧪 Mock Face ID signature generated:', mockSignature);
    return mockSignature;
  }
};

// Override navigator.mediaDevices for testing
export const mockCameraAccess = () => {
  if (!isTestMode()) return;
  
  const originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
  
  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia = async (constraints: MediaStreamConstraints) => {
      console.log('🧪 Mock camera access granted');
      
      // Create a mock video stream
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw a simple face-like pattern
        ctx.fillStyle = '#f0c674';
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#000000';
        ctx.fillRect(200, 150, 60, 60); // Left eye
        ctx.fillRect(380, 150, 60, 60); // Right eye
        ctx.fillRect(280, 280, 80, 40); // Mouth
      }
      
      const stream = canvas.captureStream(30) as MediaStream;
      return stream;
    };
  }
};

// Initialize mocks when in test mode
export const initializeTestMocks = () => {
  if (!isTestMode()) {
    console.log('📱 Real biometric authentication enabled');
    return;
  }
  
  console.log('🧪 Test mode detected - initializing biometric mocks');
  
  // Set global test mode flag
  (window as any).__SELENIUM_TEST_MODE__ = true;
  
  // Mock WebAuthn
  if (typeof window !== 'undefined') {
    (window as any).__mockWebAuthn = mockWebAuthn;
    mockCameraAccess();
  }
  
  console.log('✅ Biometric mocks initialized for testing');
};