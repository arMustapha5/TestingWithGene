import { test, expect } from '@playwright/test';

test.describe('Visual Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('visual regression - initial page load', async ({ page }) => {
    // Wait for page to fully load
    await expect(page.locator('h1')).toContainText('SecureAuth AI');
    await expect(page.locator('text=Password Authentication')).toBeVisible();
    await expect(page.locator('text=Biometric Authentication')).toBeVisible();
    
    // Take full page screenshot for visual regression
    await expect(page).toHaveScreenshot('auth-homepage.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('visual regression - password form states', async ({ page }) => {
    // Empty form state
    await expect(page.getByTestId('username-input')).toHaveScreenshot('password-form-empty.png');
    
    // Filled form state
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('admin123');
    await expect(page.locator('form').first()).toHaveScreenshot('password-form-filled.png');
    
    // Loading state
    await page.getByTestId('login-button').click();
    await expect(page.locator('text=Authenticating...')).toBeVisible();
    await expect(page.getByTestId('login-button')).toHaveScreenshot('login-button-loading.png');
  });

  test('visual regression - biometric buttons', async ({ page }) => {
    // Fingerprint button default state
    await expect(page.getByTestId('fingerprint-button')).toHaveScreenshot('fingerprint-button-default.png');
    
    // Face ID button default state
    await expect(page.getByTestId('faceid-button')).toHaveScreenshot('faceid-button-default.png');
    
    // Hover states (simulate with focus)
    await page.getByTestId('fingerprint-button').focus();
    await expect(page.getByTestId('fingerprint-button')).toHaveScreenshot('fingerprint-button-focused.png');
    
    await page.getByTestId('faceid-button').focus();
    await expect(page.getByTestId('faceid-button')).toHaveScreenshot('faceid-button-focused.png');
  });

  test('visual regression - success states', async ({ page }) => {
    // Attempt authentication to trigger success state
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('admin123');
    await page.getByTestId('login-button').click();
    
    // Wait for success state
    await expect(page.locator('text=Successfully authenticated with password')).toBeVisible({ timeout: 10000 });
    
    // Screenshot the success alert
    await expect(page.locator('text=Successfully authenticated with password').locator('..')).toHaveScreenshot('password-success-alert.png');
    
    // Screenshot the authentication status
    await expect(page.locator('text=Authentication Status').locator('..').locator('..')).toHaveScreenshot('auth-status-success.png');
  });

  test('visual regression - error states', async ({ page }) => {
    // Trigger validation error
    await page.getByTestId('login-button').click();
    
    // Wait for error toast to appear
    await expect(page.locator('text=Please enter both username and password')).toBeVisible({ timeout: 5000 });
    
    // Screenshot error toast (note: toasts may be positioned absolutely)
    await page.waitForTimeout(1000); // Ensure toast is fully rendered
    await expect(page).toHaveScreenshot('validation-error-toast.png', {
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
  });

  test('visual regression - failed authentication', async ({ page }) => {
    // Trigger authentication failure
    await page.getByTestId('username-input').fill('invalid');
    await page.getByTestId('password-input').fill('wrong');
    await page.getByTestId('login-button').click();
    
    // Wait for failure state
    await expect(page.locator('text=Failed attempts: 1/3')).toBeVisible({ timeout: 10000 });
    
    // Screenshot the failed attempts counter
    await expect(page.locator('text=Failed attempts: 1/3')).toHaveScreenshot('failed-attempts-counter.png');
  });

  test('visual regression - account lockout', async ({ page }) => {
    // Trigger multiple failures quickly for lockout
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('username-input').fill('fail');
      await page.getByTestId('password-input').fill(`wrong${i}`);
      await page.getByTestId('login-button').click();
      
      if (i < 2) {
        await expect(page.locator(`text=Failed attempts: ${i + 1}/3`)).toBeVisible({ timeout: 10000 });
        // Clear fields for next attempt
        await page.getByTestId('username-input').clear();
        await page.getByTestId('password-input').clear();
      }
    }
    
    // Wait for lockout state
    await expect(page.locator('text=Account Locked')).toBeVisible({ timeout: 10000 });
    
    // Screenshot the lockout alert
    await expect(page.locator('text=Account Locked').locator('..')).toHaveScreenshot('account-lockout-alert.png');
  });

  test('visual regression - biometric scanning animation', async ({ page }) => {
    // Start fingerprint authentication
    await page.getByTestId('fingerprint-button').click();
    
    // Wait for scanning animation to appear
    await expect(page.locator('text=Scanning biometric data...')).toBeVisible();
    
    // Screenshot the scanning state
    await expect(page.locator('text=Scanning biometric data...').locator('..').locator('..')).toHaveScreenshot('biometric-scanning-animation.png');
    
    // Let it run for a moment to capture animated elements
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Scanning biometric data...').locator('..').locator('..')).toHaveScreenshot('biometric-scanning-animation-mid.png');
  });

  test('visual regression - responsive design mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for responsive layout
    await page.waitForTimeout(500);
    
    // Screenshot mobile layout
    await expect(page).toHaveScreenshot('auth-mobile-layout.png', {
      fullPage: true
    });
    
    // Test mobile form interaction
    await page.getByTestId('username-input').fill('test');
    await expect(page).toHaveScreenshot('auth-mobile-form-filled.png', {
      fullPage: true
    });
  });

  test('visual regression - responsive design tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Wait for responsive layout
    await page.waitForTimeout(500);
    
    // Screenshot tablet layout
    await expect(page).toHaveScreenshot('auth-tablet-layout.png', {
      fullPage: true
    });
  });

  test('visual regression - dark theme consistency', async ({ page }) => {
    // The app uses dark theme by default, verify consistency
    
    // Check main sections have dark background
    await expect(page.locator('body')).toHaveCSS('background-color', /rgb\(15, 15, 23\)/);
    
    // Screenshot to verify dark theme is applied
    await expect(page).toHaveScreenshot('dark-theme-consistency.png', {
      fullPage: true
    });
  });

  test('visual regression - animation states', async ({ page }) => {
    // Test hover animations on biometric buttons
    await page.getByTestId('fingerprint-button').hover();
    await page.waitForTimeout(300); // Allow hover animation to complete
    await expect(page.getByTestId('fingerprint-button')).toHaveScreenshot('fingerprint-button-hover.png');
    
    await page.getByTestId('faceid-button').hover();
    await page.waitForTimeout(300);
    await expect(page.getByTestId('faceid-button')).toHaveScreenshot('faceid-button-hover.png');
  });

  test('visual regression - focus states accessibility', async ({ page }) => {
    // Test keyboard navigation focus states
    await page.keyboard.press('Tab'); // Focus on first input
    await expect(page.getByTestId('username-input')).toHaveScreenshot('username-input-focused.png');
    
    await page.keyboard.press('Tab'); // Focus on password input
    await expect(page.getByTestId('password-input')).toHaveScreenshot('password-input-focused.png');
    
    await page.keyboard.press('Tab'); // Focus on login button
    await expect(page.getByTestId('login-button')).toHaveScreenshot('login-button-focused.png');
  });
});