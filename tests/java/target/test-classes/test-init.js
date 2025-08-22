/**
 * Selenium Test Initialization Script
 * This script should be injected into the browser to enable test mode
 * and set up mocks for biometric authentication.
 */

// Enable test mode
window.__SELENIUM_TEST_MODE__ = true;

// Mock camera access for Face ID
if (navigator.mediaDevices) {
  const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
  
  navigator.mediaDevices.getUserMedia = async function(constraints) {
    console.log('🧪 Mock camera access granted for Selenium tests');
    
    // Create a mock video stream with a fake face
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw a simple face-like pattern for testing
      ctx.fillStyle = '#f0c674';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#000000';
      ctx.fillRect(200, 150, 60, 60); // Left eye
      ctx.fillRect(380, 150, 60, 60); // Right eye
      ctx.fillRect(280, 280, 80, 40); // Mouth
    }
    
    const stream = canvas.captureStream(30);
    return Promise.resolve(stream);
  };
}

// Set up WebAuthn mocks
window.__mockWebAuthn = {
  startRegistration: async function(options) {
    console.log('🧪 Mock WebAuthn Registration for Selenium');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: 'selenium-test-credential-' + Date.now(),
      rawId: new ArrayBuffer(64),
      response: {
        attestationObject: new ArrayBuffer(1024),
        clientDataJSON: new ArrayBuffer(256),
        transports: ['internal']
      },
      type: 'public-key'
    };
  },
  
  startAuthentication: async function(options) {
    console.log('🧪 Mock WebAuthn Authentication for Selenium');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: 'selenium-test-credential-' + Date.now(),
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

// Override PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
if (window.PublicKeyCredential) {
  window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = async function() {
    console.log('🧪 Mock: Biometric authenticator available');
    return true;
  };
}

// Add visual indicator for test mode
const testIndicator = document.createElement('div');
testIndicator.innerHTML = '🧪 TEST MODE';
testIndicator.style.cssText = `
  position: fixed;
  top: 0;
  right: 0;
  background: #ff6b6b;
  color: white;
  padding: 5px 10px;
  font-family: monospace;
  font-size: 12px;
  z-index: 9999;
  border-bottom-left-radius: 5px;
`;
document.body.appendChild(testIndicator);

console.log('✅ Selenium test mode initialized with biometric mocks');
console.log('🧪 WebAuthn and Face ID will use mock implementations');