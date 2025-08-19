import { test, expect } from '@playwright/test';

test.describe('Authentication API Tests', () => {
  const baseURL = 'http://localhost:8080';

  test.describe('Password Authentication API', () => {
    test('successful password authentication', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/auth/password`, {
        data: {
          username: 'admin',
          password: 'admin123'
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Authentication successful');
      expect(data.userId).toBe('admin-001');
    });

    test('failed password authentication', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/auth/password`, {
        data: {
          username: 'invalid',
          password: 'wrong'
        }
      });

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Invalid username or password');
    });

    test('network timeout simulation', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/auth/password`, {
        data: {
          username: 'network',
          password: 'test'
        }
      });

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain('Network timeout');
    });

    test('account lockout simulation', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/auth/password`, {
        data: {
          username: 'locked',
          password: 'test'
        }
      });

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Account temporarily locked');
    });
  });

  test.describe('Fingerprint Authentication API', () => {
    test('successful fingerprint authentication', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/auth/fingerprint`, {
        data: {
          userId: 'demo-user',
          biometricData: 'simulated-fingerprint-data'
        }
      });

      // API returns success/failure probabilistically, so we test both scenarios
      expect([200, 401]).toContain(response.status());
      const data = await response.json();
      expect(typeof data.success).toBe('boolean');
      
      if (data.success) {
        expect(data.message).toBe('Fingerprint authentication successful');
        expect(data.userId).toBe('demo-user');
        expect(data.authMethod).toBe('fingerprint');
        expect(data.timestamp).toBeDefined();
      } else {
        expect(data.message).toContain('Fingerprint');
      }
    });

    test('fingerprint API response time', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.post(`${baseURL}/api/auth/fingerprint`, {
        data: {
          userId: 'test-user',
          biometricData: 'test-fingerprint-data'
        }
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Fingerprint should take at least 1 second (simulated processing)
      expect(responseTime).toBeGreaterThan(1000);
      expect(responseTime).toBeLessThan(5000); // But not too long
    });
  });

  test.describe('Face ID Authentication API', () => {
    test('successful Face ID authentication', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/auth/face`, {
        data: {
          userId: 'demo-user',
          biometricData: 'simulated-face-data'
        }
      });

      expect([200, 401]).toContain(response.status());
      const data = await response.json();
      expect(typeof data.success).toBe('boolean');
      
      if (data.success) {
        expect(data.message).toBe('Face ID authentication successful');
        expect(data.userId).toBe('demo-user');
        expect(data.authMethod).toBe('face');
        expect(data.confidence).toBeGreaterThan(0.7);
        expect(data.timestamp).toBeDefined();
      }
    });

    test('Face ID API response time', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.post(`${baseURL}/api/auth/face`, {
        data: {
          userId: 'test-user',
          biometricData: 'test-face-data'
        }
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Face ID should take longer than fingerprint (1.5-4.5 seconds)
      expect(responseTime).toBeGreaterThan(1500);
      expect(responseTime).toBeLessThan(6000);
    });

    test('Face ID error scenarios', async ({ request }) => {
      // Test various time-based error scenarios
      for (let i = 0; i < 5; i++) {
        const response = await request.post(`${baseURL}/api/auth/face`, {
          data: {
            userId: 'demo-user',
            biometricData: `test-face-data-${i}`
          }
        });

        const data = await response.json();
        
        if (!data.success) {
          // Verify error messages are appropriate for Face ID
          const validErrors = [
            'Face not recognized',
            'Insufficient lighting',
            'Camera access denied',
            'Multiple faces detected',
            'Face ID sensor error'
          ];
          
          const hasValidError = validErrors.some(error => 
            data.message.includes(error) || data.message.includes('Face')
          );
          expect(hasValidError).toBe(true);
        }
        
        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });
  });

  test.describe('API Error Handling', () => {
    test('malformed request to password endpoint', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/auth/password`, {
        data: {
          invalidField: 'test'
        }
      });

      expect(response.status()).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Internal server error');
    });

    test('malformed request to biometric endpoints', async ({ request }) => {
      const fingerprintResponse = await request.post(`${baseURL}/api/auth/fingerprint`, {
        data: {
          invalidField: 'test'
        }
      });

      expect(fingerprintResponse.status()).toBe(500);
      
      const faceResponse = await request.post(`${baseURL}/api/auth/face`, {
        data: {
          invalidField: 'test'
        }
      });

      expect(faceResponse.status()).toBe(500);
    });

    test('CORS headers are present', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/auth/password`, {
        data: {
          username: 'test',
          password: 'test'
        }
      });

      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBe('*');
      expect(headers['content-type']).toBe('application/json');
    });
  });
});