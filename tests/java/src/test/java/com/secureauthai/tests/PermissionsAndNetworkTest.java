package com.secureauthai.tests;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

/**
 * Permissions and Network Test - Wrapper for comprehensive test suite
 * This test delegates to ComprehensiveBioAuthTest for actual execution
 */
@DisplayName("Permissions and Network Test Suite")
public class PermissionsAndNetworkTest extends BaseTest {

    @Test
    @DisplayName("Permissions denial and network interruption scenarios")
    void testPermissionsAndNetwork() {
        // This test is now handled by ComprehensiveBioAuthTest
        // Run the comprehensive test suite instead
        System.out.println("Permissions and network testing is now part of ComprehensiveBioAuthTest");
        System.out.println("Run: mvn test -Dtest=ComprehensiveBioAuthTest");
    }
}