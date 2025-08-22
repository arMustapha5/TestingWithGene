# Bioauthentication Test Suite Overview

This test suite covers all the automated test scenarios for the SecureAuth AI bioauthentication system as requested:

## Test Classes and Coverage

### 1. BiometricSuccessTest.java
**Covers**: Bioauthentication success scenarios
- `biometricSuccessScenario()`: Tests successful biometric authentication with valid user (etornam.koko)
- `biometricRegistrationSuccess()`: Tests successful biometric credential registration

### 2. BiometricFailureTest.java  
**Covers**: Bioauthentication failure scenarios
- `biometricFailureShowsErrorAndDoesNotLogin()`: Tests authentication failure with invalid user
- `biometricFailureWithInvalidUser()`: Tests failure with completely invalid username
- `biometricFailureMultipleAttempts()`: Tests multiple consecutive failure attempts

### 3. FallbackAfterFailuresTest.java
**Covers**: Fallback from bioauthentication to password
- `fallbackToPasswordAfterBiometricFailures()`: Tests automatic fallback to password after 3 biometric failures
- `automaticFallbackAfterLockout()`: Tests fallback availability after biometric lockout
- `fallbackFromFaceToPassword()`: Tests fallback from face authentication to password

### 4. FaceLockoutTest.java
**Covers**: Lockout after multiple failed bioauth attempts  
- `faceLockoutAfterThreeFailures()`: Tests face authentication lockout after 3 failures
- `biometricLockoutAfterMultipleFailures()`: Tests biometric authentication lockout
- `lockoutPreventsAdditionalAttempts()`: Verifies lockout prevents further attempts

### 5. PermissionsAndNetworkTest.java
**Covers**: Permissions denial & Network interruption scenarios
- `permissionsDeniedScenario()`: Tests biometric permissions denial (WebAuthn browser permissions)
- `facePermissionsDeniedScenario()`: Tests face authentication camera permissions denial
- `networkInterruptionScenario()`: Tests network interruption during authentication
- `networkTimeoutDuringAuthentication()`: Tests network timeout scenarios  
- `serviceUnavailableScenario()`: Tests authentication service unavailability

## Required Test Scenarios Coverage

✅ **a. Fallback from bioauthentication to password**
- Implemented in `FallbackAfterFailuresTest`
- Tests automatic and manual fallback scenarios
- Covers both biometric and face authentication fallback

✅ **b. Bioauthentication success and failure**  
- Success scenarios in `BiometricSuccessTest`
- Failure scenarios in `BiometricFailureTest`
- Covers registration, authentication, and various failure conditions

✅ **c. Lockout after multiple failed bioauth attempts**
- Implemented in `FaceLockoutTest` 
- Tests 3-attempt lockout for both biometric and face authentication
- Verifies lockout prevents additional attempts

✅ **d. Permissions denial (biometric access denied by OS)**
- Implemented in `PermissionsAndNetworkTest`
- Tests WebAuthn permissions denial
- Tests camera access permissions denial for face authentication

✅ **e. Network interruption during bioauthentication**
- Implemented in `PermissionsAndNetworkTest`
- Tests network timeouts, service unavailability
- Tests authentication behavior during network issues

## Test User Credentials

- **Valid User**: etornam.koko (password: 12345678)
- **Invalid Users**: Various invalid usernames for failure testing
- **Email**: etornam.koko@example.com (for password fallback tests)

## Running the Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=BiometricSuccessTest

# Run with specific base URL
mvn test -DbaseUrl=http://localhost:8081
```

## Test Environment

- **Browser**: Chrome (headful mode for visibility)
- **WebDriver**: ChromeDriver with WebDriverManager auto-setup
- **Base URL**: http://localhost:8081 (configurable)
- **Timeouts**: 15-second default wait times for UI elements
- **Framework**: JUnit 5 with Selenium WebDriver 4.21.0