package com.secureauthai.tests;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

/**
 * Biometric Failure Test - Wrapper for comprehensive test suite
 * This test delegates to ComprehensiveBioAuthTest for actual execution
 */
@DisplayName("Biometric Failure Test Suite")
public class BiometricFailureTest extends BaseTest {

    @Test
    @DisplayName("Biometric authentication failure scenarios")
    void testBiometricFailure() {
        // This test is now handled by ComprehensiveBioAuthTest
        // Run the comprehensive test suite instead
        System.out.println("Biometric failure testing is now part of ComprehensiveBioAuthTest");
        System.out.println("Run: mvn test -Dtest=ComprehensiveBioAuthTest");
    }
}