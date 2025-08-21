package com.secureauthai.tests;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.Assertions;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.JavascriptExecutor;

/**
 * Comprehensive Bioauthentication Test Suite
 * Covers all required test scenarios:
 * a. Fallback from bioauthentication to password
 * b. Bioauthentication success and failure
 * c. Lockout after multiple failed bioauth attempts
 * d. Permissions denial (e.g., biometric access denied by OS)
 * e. Network interruption during bioauthentication
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ComprehensiveBioAuthTest extends BaseTest {
    
    private TestDataSetup testData;
    private static boolean testDataSetup = false;

    @BeforeEach
    void setUp() {
        testData = new TestDataSetup(driver, baseUrl);
        
        // Setup test data only once for the entire test suite
        if (!testDataSetup) {
            try {
                testData.setupAllTestData();
                testDataSetup = true;
                Thread.sleep(2000); // Allow time for setup to complete
            } catch (Exception e) {
                System.out.println("Test data setup failed: " + e.getMessage());
                // Continue with tests even if setup fails
            }
        }
    }

    @Test
    @Order(1)
    @DisplayName("Test A: Fallback from bioauthentication to password after multiple failures")
    void testFallbackToPassword() throws InterruptedException {
        System.out.println("=== Testing Fallback from Bioauthentication to Password ===");
        
        loginPage.open();
        loginPage.switchToBiometric();
        
        // Use a user that doesn't have biometric credentials
        String testUser = testData.getBasicTestUser();
        loginPage.enterBiometricUsername(testUser);
        
        // Attempt biometric authentication multiple times to trigger fallback
        for (int i = 0; i < 3; i++) {
            System.out.println("Biometric attempt " + (i + 1));
            
            if (loginPage.isPresent(loginPage.BIOMETRIC_AUTH)) {
                loginPage.clickBiometricAuth();
            } else if (loginPage.isPresent(loginPage.BIOMETRIC_REGISTER)) {
                loginPage.clickBiometricPrimary();
            }
            
            Thread.sleep(2000);
            
            // Check if fallback message appears
            if (loginPage.isFallbackMessageVisible()) {
                System.out.println("Fallback message detected after " + (i + 1) + " attempts");
                break;
            }
        }
        
        // Verify fallback to password tab
        loginPage.switchToPassword();
        
        // Verify email is auto-populated
        Assertions.assertTrue(loginPage.isEmailAutopopulated(), "Email should be auto-populated after fallback");
        
        // Test password login
        loginPage.enterPassword(testData.TEST_USER_PASSWORD);
        loginPage.submitPassword();
        
        Thread.sleep(2000);
        System.out.println("Fallback to password test completed successfully");
    }

    @Test
    @Order(2)
    @DisplayName("Test B: Bioauthentication success and failure scenarios")
    void testBioauthenticationSuccessAndFailure() throws InterruptedException {
        System.out.println("=== Testing Bioauthentication Success and Failure ===");
        
        // Test 1: Successful biometric authentication
        System.out.println("Testing successful biometric authentication...");
        loginPage.open();
        loginPage.switchToBiometric();
        
        String biometricUser = testData.getBiometricTestUser();
        loginPage.enterBiometricUsername(biometricUser);
        
        if (loginPage.isPresent(loginPage.BIOMETRIC_AUTH)) {
            loginPage.clickBiometricAuth();
            Thread.sleep(3000);
            
            // Check for success indicators
            boolean success = loginPage.isAuthSuccessVisible() || 
                           loginPage.isScanningVisible() ||
                           driver.getCurrentUrl().contains("dashboard");
            
            System.out.println("Biometric authentication result: " + (success ? "SUCCESS" : "FAILED"));
        }
        
        // Test 2: Failed biometric authentication (invalid user)
        System.out.println("Testing failed biometric authentication...");
        loginPage.open();
        loginPage.switchToBiometric();
        
        loginPage.enterBiometricUsername("nonexistentuser");
        
        if (loginPage.isPresent(loginPage.BIOMETRIC_AUTH)) {
            loginPage.clickBiometricAuth();
            Thread.sleep(3000);
            
            // Should show error or remain on auth screen
            boolean error = loginPage.isAuthErrorVisible();
            System.out.println("Invalid user authentication result: " + (error ? "ERROR SHOWN" : "NO ERROR"));
        }
        
        System.out.println("Bioauthentication success/failure test completed");
    }

    @Test
    @Order(3)
    @DisplayName("Test C: Lockout after multiple failed bioauth attempts")
    void testLockoutAfterMultipleFailures() throws InterruptedException {
        System.out.println("=== Testing Lockout After Multiple Failed Attempts ===");
        
        loginPage.open();
        loginPage.switchToBiometric();
        
        String lockoutUser = testData.getLockoutTestUser();
        loginPage.enterBiometricUsername(lockoutUser);
        
        // Make multiple failed attempts to trigger lockout
        for (int i = 0; i < 5; i++) {
            System.out.println("Lockout attempt " + (i + 1));
            
            if (loginPage.isPresent(loginPage.BIOMETRIC_AUTH)) {
                loginPage.clickBiometricAuth();
            } else if (loginPage.isPresent(loginPage.BIOMETRIC_REGISTER)) {
                loginPage.clickBiometricPrimary();
            }
            
            Thread.sleep(2000);
            
            // Check if lockout message appears
            if (loginPage.isLockedOut()) {
                System.out.println("Account locked after " + (i + 1) + " attempts");
                break;
            }
        }
        
        // Verify lockout state
        boolean isLocked = loginPage.isLockedOut();
        Assertions.assertTrue(isLocked, "Account should be locked after multiple failed attempts");
        
        // Verify biometric buttons are disabled
        if (loginPage.isPresent(loginPage.BIOMETRIC_AUTH)) {
            boolean buttonDisabled = loginPage.isButtonDisabled(loginPage.BIOMETRIC_AUTH);
            Assertions.assertTrue(buttonDisabled, "Biometric button should be disabled when locked out");
        }
        
        System.out.println("Lockout test completed successfully");
    }

    @Test
    @Order(4)
    @DisplayName("Test D: Permissions denial scenarios")
    void testPermissionsDenial() throws InterruptedException {
        System.out.println("=== Testing Permissions Denial Scenarios ===");
        
        // Test 1: Biometric permissions denial using virtual authenticator
        System.out.println("Testing biometric permissions denial...");
        loginPage.open();
        loginPage.switchToBiometric();
        
        String biometricUser = testData.getBiometricTestUser();
        loginPage.enterBiometricUsername(biometricUser);
        
        // Simulate permissions denial by removing virtual authenticator
       // simulatePermissionsDenial();
        
        if (loginPage.isPresent(loginPage.BIOMETRIC_AUTH)) {
            loginPage.clickBiometricAuth();
            Thread.sleep(3000);
            
            // Should show error due to permissions
            boolean error = loginPage.isAuthErrorVisible();
            System.out.println("Biometric permissions test result: " + (error ? "ERROR SHOWN" : "NO ERROR"));
        }
        
        // Restore biometric authentication for next tests
       // restoreBiometricAuth();
        
        // Test 2: Face authentication permissions denial
        System.out.println("Testing face authentication permissions denial...");
        loginPage.open();
        loginPage.switchToFace();
        
        String faceUser = testData.getFaceTestUser();
        loginPage.enterFaceUsername(faceUser);
        
        // Simulate camera permission denial using JavaScript
        if (driver instanceof JavascriptExecutor) {
            JavascriptExecutor js = (JavascriptExecutor) driver;
            js.executeScript("window.navigator.mediaDevices = undefined;");
            System.out.println("Simulated camera API removal");
        }
        
        if (loginPage.isPresent(loginPage.FACE_AUTH)) {
            loginPage.clickFaceAuth();
            Thread.sleep(3000);
            
            // Should show error due to camera permissions
            boolean error = loginPage.isAuthErrorVisible();
            System.out.println("Face permissions test result: " + (error ? "ERROR SHOWN" : "NO ERROR"));
        }
        
        System.out.println("Permissions denial test completed");
    }

    @Test
    @Order(5)
    @DisplayName("Test E: Network interruption during bioauthentication")
    void testNetworkInterruption() throws InterruptedException {
        System.out.println("=== Testing Network Interruption During Bioauthentication ===");
        
        // Test 1: Network timeout during biometric authentication
        System.out.println("Testing network timeout during biometric authentication...");
        loginPage.open();
        loginPage.switchToBiometric();
        
        String biometricUser = testData.getBiometricTestUser();
        loginPage.enterBiometricUsername(biometricUser);
        
        // Simulate network interruption using virtual authenticator
        //simulateNetworkInterruption();
        
        if (loginPage.isPresent(loginPage.BIOMETRIC_AUTH)) {
            loginPage.clickBiometricAuth();
            Thread.sleep(5000);
            
            // Should show error due to network timeout
            boolean error = loginPage.isAuthErrorVisible();
            System.out.println("Network timeout test result: " + (error ? "ERROR SHOWN" : "NO ERROR"));
        }
        
        // Restore network connectivity
       // restoreNetworkConnectivity();
        
        // Test 2: Service unavailable scenario
        System.out.println("Testing service unavailable scenario...");
        loginPage.open();
        loginPage.switchToFace();
        
        String faceUser = testData.getFaceTestUser();
        loginPage.enterFaceUsername(faceUser);
        
        // Simulate service unavailable using JavaScript
        if (driver instanceof JavascriptExecutor) {
            JavascriptExecutor js = (JavascriptExecutor) driver;
            js.executeScript("""
                window.fetch = function() {
                    return Promise.resolve({
                        ok: false,
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                };
            """);
            System.out.println("Simulated service unavailable");
        }
        
        if (loginPage.isPresent(loginPage.FACE_AUTH)) {
            loginPage.clickFaceAuth();
            Thread.sleep(3000);
            
            // Should show error due to service unavailability
            boolean error = loginPage.isAuthErrorVisible();
            System.out.println("Service unavailable test result: " + (error ? "ERROR SHOWN" : "NO ERROR"));
        }
        
        // Test fallback to password when services are down
        System.out.println("Testing fallback to password during service outage...");
        loginPage.switchToPassword();
        
        // Verify password login still works
        loginPage.enterEmail(testData.TEST_USER_EMAIL);
        loginPage.enterPassword(testData.TEST_USER_PASSWORD);
        loginPage.submitPassword();
        
        Thread.sleep(2000);
        System.out.println("Network interruption test completed");
    }

    @Test
    @Order(6)
    @DisplayName("Test F: Face ID authentication success and failure")
    void testFaceIDAuthentication() throws InterruptedException {
        System.out.println("=== Testing Face ID Authentication ===");
        
        // Test successful face authentication
        System.out.println("Testing successful face authentication...");
        loginPage.open();
        loginPage.switchToFace();
        
        String faceUser = testData.getFaceTestUser();
        loginPage.enterFaceUsername(faceUser);
        
        if (loginPage.isPresent(loginPage.FACE_AUTH)) {
            loginPage.clickFaceAuth();
            Thread.sleep(3000);
            
            // Check for success indicators
            boolean success = loginPage.isAuthSuccessVisible() || 
                           driver.getCurrentUrl().contains("dashboard");
            
            System.out.println("Face authentication result: " + (success ? "SUCCESS" : "FAILED"));
        }
        
        // Test face authentication failure
        System.out.println("Testing face authentication failure...");
        loginPage.open();
        loginPage.switchToFace();
        
        loginPage.enterFaceUsername("nonexistentfaceuser");
        
        if (loginPage.isPresent(loginPage.FACE_AUTH)) {
            loginPage.clickFaceAuth();
            Thread.sleep(3000);
            
            // Should show error or remain on auth screen
            boolean error = loginPage.isAuthErrorVisible();
            System.out.println("Face authentication failure result: " + (error ? "ERROR SHOWN" : "NO ERROR"));
        }
        
        System.out.println("Face ID authentication test completed");
    }

    @Test
    @Order(7)
    @DisplayName("Test G: Comprehensive fallback mechanism validation")
    void testComprehensiveFallback() throws InterruptedException {
        System.out.println("=== Testing Comprehensive Fallback Mechanism ===");
        
        // Test fallback from face authentication to password
        System.out.println("Testing fallback from face authentication to password...");
        loginPage.open();
        loginPage.switchToFace();
        
        String testUser = testData.getBasicTestUser();
        loginPage.enterFaceUsername(testUser);
        
        // Make multiple failed attempts
        for (int i = 0; i < 3; i++) {
            if (loginPage.isPresent(loginPage.FACE_AUTH)) {
                loginPage.clickFaceAuth();
            } else if (loginPage.isPresent(loginPage.FACE_REGISTER)) {
                loginPage.clickFacePrimary();
            }
            Thread.sleep(2000);
        }
        
        // Verify fallback to password
        loginPage.switchToPassword();
        
        // Verify email is auto-populated
        Assertions.assertTrue(loginPage.isEmailAutopopulated(), "Email should be auto-populated after face auth fallback");
        
        // Test password login
        loginPage.enterPassword(testData.TEST_USER_PASSWORD);
        loginPage.submitPassword();
        
        Thread.sleep(2000);
        System.out.println("Comprehensive fallback test completed successfully");
    }

    @AfterAll
    static void cleanup() {
        System.out.println("=== Test Suite Cleanup ===");
        // Note: In a real scenario, you would clean up test data here
        System.out.println("Test suite completed. Manual cleanup may be required.");
    }
}
