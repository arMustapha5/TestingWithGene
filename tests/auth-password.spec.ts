import { test, expect } from '@playwright/test';

test.describe('Password Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('SecureAuth AI');
  });

  test('successful password authentication with valid credentials', async ({ page }) => {
    // Test admin user login
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('admin123');
    await page.getByTestId('login-button').click();

    // Wait for authentication to complete
    await expect(page.locator('[data-testid="reset-button"]')).toBeVisible({ timeout: 10000 });
    
    // Verify success message
    await expect(page.locator('text=Successfully authenticated with password')).toBeVisible();
    
    // Verify status shows authenticated
    await expect(page.locator('text=Authenticated')).toBeVisible();
    await expect(page.locator('text=Password')).toBeVisible();
  });

  test('password authentication with demo user', async ({ page }) => {
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();

    await expect(page.locator('text=Successfully authenticated with password')).toBeVisible({ timeout: 10000 });
  });

  test('failed password authentication with invalid credentials', async ({ page }) => {
    await page.getByTestId('username-input').fill('invalid');
    await page.getByTestId('password-input').fill('wrong');
    await page.getByTestId('login-button').click();

    // Check for error message
    await expect(page.locator('text=Invalid username or password')).toBeVisible({ timeout: 10000 });
    
    // Verify failed attempts counter
    await expect(page.locator('text=Failed attempts: 1/3')).toBeVisible();
  });

  test('account lockout after multiple failed attempts', async ({ page }) => {
    // First failed attempt
    await page.getByTestId('username-input').fill('testfail');
    await page.getByTestId('password-input').fill('wrong1');
    await page.getByTestId('login-button').click();
    await expect(page.locator('text=Failed attempts: 1/3')).toBeVisible({ timeout: 10000 });

    // Second failed attempt
    await page.getByTestId('username-input').fill('testfail');
    await page.getByTestId('password-input').fill('wrong2');
    await page.getByTestId('login-button').click();
    await expect(page.locator('text=Failed attempts: 2/3')).toBeVisible({ timeout: 10000 });

    // Third failed attempt - should trigger lockout
    await page.getByTestId('username-input').fill('testfail');
    await page.getByTestId('password-input').fill('wrong3');
    await page.getByTestId('login-button').click();
    
    // Verify account is locked
    await expect(page.locator('text=Account Locked')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Multiple failed authentication attempts detected')).toBeVisible();
    
    // Verify login button is disabled
    await expect(page.getByTestId('login-button')).toBeDisabled();
  });

  test('form validation for empty fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByTestId('login-button').click();
    
    // Should show validation error (toast notification)
    await expect(page.locator('text=Please enter both username and password')).toBeVisible({ timeout: 5000 });
  });

  test('form validation for username only', async ({ page }) => {
    await page.getByTestId('username-input').fill('testuser');
    await page.getByTestId('login-button').click();
    
    await expect(page.locator('text=Please enter both username and password')).toBeVisible({ timeout: 5000 });
  });

  test('form validation for password only', async ({ page }) => {
    await page.getByTestId('password-input').fill('testpass');
    await page.getByTestId('login-button').click();
    
    await expect(page.locator('text=Please enter both username and password')).toBeVisible({ timeout: 5000 });
  });

  test('reset session functionality', async ({ page }) => {
    // First authenticate successfully
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('admin123');
    await page.getByTestId('login-button').click();
    
    await expect(page.locator('text=Authenticated')).toBeVisible({ timeout: 10000 });
    
    // Reset the session
    await page.getByTestId('reset-button').click();
    
    // Verify session is reset
    await expect(page.locator('text=Not Authenticated')).toBeVisible();
    await expect(page.getByTestId('username-input')).toHaveValue('');
    await expect(page.getByTestId('password-input')).toHaveValue('');
  });

  test('network error simulation', async ({ page }) => {
    await page.getByTestId('username-input').fill('network');
    await page.getByTestId('password-input').fill('test');
    await page.getByTestId('login-button').click();

    await expect(page.locator('text=Network timeout')).toBeVisible({ timeout: 10000 });
  });

  test('UI loading states during authentication', async ({ page }) => {
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('admin123');
    
    // Click login and immediately check loading state
    await page.getByTestId('login-button').click();
    await expect(page.locator('text=Authenticating...')).toBeVisible();
    
    // Verify button is disabled during loading
    await expect(page.getByTestId('login-button')).toBeDisabled();
    
    // Wait for completion
    await expect(page.locator('text=Authenticated')).toBeVisible({ timeout: 10000 });
  });
});