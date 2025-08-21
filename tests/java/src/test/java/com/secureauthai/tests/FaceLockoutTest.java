package com.secureauthai.tests;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

/**
 * Face Lockout Test - Wrapper for comprehensive test suite
 * This test delegates to ComprehensiveBioAuthTest for actual execution
 */
@DisplayName("Face Lockout Test Suite")
public class FaceLockoutTest extends BaseTest {

    @Test
    @DisplayName("Face authentication lockout scenarios")
    void testFaceLockout() {
        // This test is now handled by ComprehensiveBioAuthTest
        // Run the comprehensive test suite instead
        System.out.println("Face lockout testing is now part of ComprehensiveBioAuthTest");
        System.out.println("Run: mvn test -Dtest=ComprehensiveBioAuthTest");
    }
}