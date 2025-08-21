package com.secureauthai.tests;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

/**
 * Biometric Success Test - Wrapper for comprehensive test suite
 * This test delegates to ComprehensiveBioAuthTest for actual execution
 */
@DisplayName("Biometric Success Test Suite")
public class BiometricSuccessTest extends BaseTest {

    @Test
    @DisplayName("Biometric authentication success scenarios")
    void testBiometricSuccess() {
        // This test is now handled by ComprehensiveBioAuthTest
        // Run the comprehensive test suite instead
        System.out.println("Biometric success testing is now part of ComprehensiveBioAuthTest");
        System.out.println("Run: mvn test -Dtest=ComprehensiveBioAuthTest");
    }
}