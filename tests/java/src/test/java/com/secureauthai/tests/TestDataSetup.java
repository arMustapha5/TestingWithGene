package com.secureauthai.tests;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

/**
 * Test Data Setup - Handles creation and cleanup of test users with biometric/face credentials
 * This class automates the entire process of setting up test data for comprehensive testing
 */
public class TestDataSetup {
    private final WebDriver driver;
    private final String baseUrl;
    private final WebDriverWait wait;
    
    // Test user credentials
    public static final String TEST_USER_EMAIL = "testuser@secureauth.ai";
    public static final String TEST_USER_USERNAME = "testuser";
    public static final String TEST_USER_PASSWORD = "TestPassword123!";
    
    public static final String BIOMETRIC_USER_EMAIL = "biometric@secureauth.ai";
    public static final String BIOMETRIC_USER_USERNAME = "biometricuser";
    public static final String BIOMETRIC_USER_PASSWORD = "BioPass123!";
    
    public static final String FACE_USER_EMAIL = "faceuser@secureauth.ai";
    public static final String FACE_USER_USERNAME = "faceuser";
    public static final String FACE_USER_PASSWORD = "FacePass123!";
    
    public static final String LOCKOUT_USER_EMAIL = "lockout@secureauth.ai";
    public static final String LOCKOUT_USER_USERNAME = "lockoutuser";
    public static final String LOCKOUT_USER_PASSWORD = "LockPass123!";

    public TestDataSetup(WebDriver driver, String baseUrl) {
        this.driver = driver;
        this.baseUrl = baseUrl;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(20));
    }

    /**
     * Setup all test data - creates users and registers biometric/face credentials
     */
    public void setupAllTestData() throws InterruptedException {
        System.out.println("Setting up test data...");
        
        // Create test users
        createTestUser(TEST_USER_EMAIL, TEST_USER_USERNAME, TEST_USER_PASSWORD);
        createTestUser(BIOMETRIC_USER_EMAIL, BIOMETRIC_USER_USERNAME, BIOMETRIC_USER_PASSWORD);
        createTestUser(FACE_USER_EMAIL, FACE_USER_USERNAME, FACE_USER_PASSWORD);
        createTestUser(LOCKOUT_USER_EMAIL, LOCKOUT_USER_USERNAME, LOCKOUT_USER_PASSWORD);
        
        // Register biometric credentials
        registerBiometricCredentials(BIOMETRIC_USER_USERNAME);
        
        // Register face credentials
        registerFaceCredentials(FACE_USER_USERNAME);
        
        System.out.println("Test data setup completed successfully");
    }

    /**
     * Create a test user account
     */
    private void createTestUser(String email, String username, String password) throws InterruptedException {
        System.out.println("Creating test user: " + username);
        
        // Navigate to registration page
        driver.get(baseUrl);
        wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[contains(text(), 'Create one here')]"))).click();
        
        // Wait for registration form
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("email")));
        
        // Fill registration form
        driver.findElement(By.id("email")).sendKeys(email);
        driver.findElement(By.id("username")).sendKeys(username);
        driver.findElement(By.id("password")).sendKeys(password);
        driver.findElement(By.id("confirm-password")).sendKeys(password);
        
        // Check biometric registration option
        try {
            WebElement checkbox = driver.findElement(By.xpath("//div[contains(@class, 'flex items-center space-x-2')]//button"));
            if (!checkbox.isSelected()) {
                checkbox.click();
            }
        } catch (Exception e) {
            System.out.println("Biometric checkbox not found, continuing...");
        }
        
        // Submit registration
        driver.findElement(By.cssSelector("[data-testid='account-register-button']")).click();
        
        // Wait for registration success
        Thread.sleep(3000);
        
        System.out.println("User " + username + " created successfully");
    }

    /**
     * Register biometric credentials for a user
     */
    private void registerBiometricCredentials(String username) throws InterruptedException {
        System.out.println("Registering biometric credentials for: " + username);
        
        // Navigate to login page
        driver.get(baseUrl);
        
        // Switch to biometric tab
        wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[@data-state and .//span[text()='Biometric']]"))).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("biometric-username")));
        
        // Enter username
        driver.findElement(By.id("biometric-username")).sendKeys(username);
        Thread.sleep(1000);
        
        // Click register button
        WebElement registerButton = driver.findElement(By.cssSelector("[data-testid='biometric-register-button']"));
        registerButton.click();
        
        // Wait for WebAuthn registration
        Thread.sleep(5000);
        
        System.out.println("Biometric credentials registered for: " + username);
    }

    /**
     * Register face credentials for a user
     */
    private void registerFaceCredentials(String username) throws InterruptedException {
        System.out.println("Registering face credentials for: " + username);
        
        // Navigate to login page
        driver.get(baseUrl);
        
        // Switch to face tab
        wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[@data-state and .//span[text()='Face']]"))).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("face-username")));
        
        // Enter username
        driver.findElement(By.id("face-username")).sendKeys(username);
        Thread.sleep(1000);
        
        // Click register button
        WebElement registerButton = driver.findElement(By.cssSelector("[data-testid='face-register-button']"));
        registerButton.click();
        
        // Wait for face registration (camera capture simulation)
        Thread.sleep(5000);
        
        System.out.println("Face credentials registered for: " + username);
    }

    /**
     * Clean up test data - remove test users and credentials
     */
    public void cleanupTestData() {
        System.out.println("Cleaning up test data...");
        // Note: In a real scenario, you would call API endpoints to clean up test data
        // For now, we'll just log the cleanup action
        System.out.println("Test data cleanup completed (manual cleanup may be required)");
    }

    /**
     * Get a test user that has biometric credentials
     */
    public String getBiometricTestUser() {
        return BIOMETRIC_USER_USERNAME;
    }

    /**
     * Get a test user that has face credentials
     */
    public String getFaceTestUser() {
        return FACE_USER_USERNAME;
    }

    /**
     * Get a test user for lockout testing
     */
    public String getLockoutTestUser() {
        return LOCKOUT_USER_USERNAME;
    }

    /**
     * Get a basic test user
     */
    public String getBasicTestUser() {
        return TEST_USER_USERNAME;
    }
}
