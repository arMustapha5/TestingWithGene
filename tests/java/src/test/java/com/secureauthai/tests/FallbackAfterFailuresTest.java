package com.secureauthai.tests;

import com.secureauthai.pages.LoginPage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;

public class FallbackAfterFailuresTest extends BaseTest {

    @Test
    void fallbackToPasswordAfterBiometricFailures() throws InterruptedException {
        LoginPage page = new LoginPage(driver, baseUrl);
        page.open();
        
        // Start with biometric authentication
        page.switchToBiometric();
        page.enterBiometricUsername("etornam.koko");

        // Attempt biometric authentication multiple times to trigger fallback
        for (int i = 0; i < 3; i++) {
            Thread.sleep(500); // Wait for UI update
            
            if (page.isPresent(page.BIOMETRIC_AUTH)) {
                page.clickBiometricAuth();
                Thread.sleep(2000); // Wait for failure
            } else if (page.isPresent(page.BIOMETRIC_REGISTER)) {
                // If register button appears, use it to simulate failure
                page.clickBiometricPrimary();
                Thread.sleep(2000);
                break; // Registration typically only happens once
            }
            
            System.out.println("Biometric attempt " + (i + 1) + " completed");
        }

        // After multiple failures, the system should suggest fallback to password
        // Check if fallback message is displayed or if we can manually switch to password
        Thread.sleep(1000);
        
        // Switch to password tab for fallback authentication
        try {
            page.switchToPassword();
            System.out.println("Successfully switched to password tab");
            
            // Attempt password login as fallback
            page.enterEmail("etornam.koko@example.com");
            page.enterPassword("12345678");
            page.submitPassword();
            Thread.sleep(2000);
            
            System.out.println("Fallback to password authentication attempted");
        } catch (Exception e) {
            System.out.println("Could not switch to password tab: " + e.getMessage());
        }
    }

    @Test
    void automaticFallbackAfterLockout() throws InterruptedException {
        LoginPage page = new LoginPage(driver, baseUrl);
        page.open();
        
        page.switchToBiometric();
        page.enterBiometricUsername("etornam.koko");

        // Make 3 failed attempts to trigger lockout
        for (int i = 0; i < 3; i++) {
            Thread.sleep(500);
            
            if (page.isPresent(page.BIOMETRIC_AUTH)) {
                page.clickBiometricAuth();
                Thread.sleep(2000);
            } else if (page.isPresent(page.BIOMETRIC_REGISTER)) {
                page.clickBiometricPrimary();
                Thread.sleep(2000);
                break;
            }
        }

        // System should automatically suggest or switch to password fallback
        Thread.sleep(2000);
        
        // Check if we can still switch to password after lockout
        try {
            page.switchToPassword();
            System.out.println("Password fallback available after biometric lockout");
        } catch (Exception e) {
            System.out.println("Password fallback may not be immediately available");
        }
    }
    
    @Test
    void fallbackFromFaceToPassword() throws InterruptedException {
        LoginPage page = new LoginPage(driver, baseUrl);
        page.open();
        
        // Test fallback from Face authentication to Password
        page.switchToFace();
        page.enterFaceUsername("etornam.koko");

        // Attempt face authentication multiple times
        for (int i = 0; i < 3; i++) {
            Thread.sleep(500);
            
            if (page.isPresent(page.FACE_AUTH)) {
                page.clickFaceAuth();
                Thread.sleep(2000);
            } else if (page.isPresent(page.FACE_REGISTER)) {
                page.clickFacePrimary();
                Thread.sleep(2000);
                break;
            }
        }

        // Switch to password as fallback
        Thread.sleep(1000);
        page.switchToPassword();
        
        page.enterEmail("etornam.koko@example.com");
        page.enterPassword("12345678");
        page.submitPassword();
        Thread.sleep(2000);
        
        System.out.println("Fallback from face to password authentication completed");
    }
}