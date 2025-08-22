# SecureAuth AI - Comprehensive Bioauthentication Test Suite

## Overview

This test suite provides comprehensive automation testing for a bioauthentication system that supports:
- **Biometric Authentication** (Fingerprint/WebAuthn)
- **Face ID Authentication** (Camera-based facial recognition)
- **Password Authentication** (Fallback mechanism)
- **Account Security** (Lockout, permissions, network resilience)

## Test Architecture

### Framework Components
- **Selenium WebDriver** - UI automation framework
- **JUnit 5** - Testing framework with advanced annotations
- **Maven** - Build and dependency management
- **Page Object Model** - Maintainable test structure
- **Test Data Setup** - Automated test data creation

### Test Structure
```
tests/java/
├── src/test/java/com/secureauthai/
│   ├── pages/
│   │   └── LoginPage.java          # Page Object for login UI
│   ├── tests/
│   │   ├── BaseTest.java           # Base test configuration
│   │   ├── TestDataSetup.java      # Automated test data management
│   │   ├── ComprehensiveBioAuthTest.java  # Main test scenarios
│   │   └── TestSuiteRunner.java    # Test execution orchestration
│   └── pom.xml                     # Maven configuration
```

## Test Scenarios Coverage

### ✅ Test A: Fallback from Bioauthentication to Password
**Objective**: Verify system automatically switches to password login after multiple biometric failures

**Test Steps**:
1. Navigate to biometric authentication tab
2. Enter username without biometric credentials
3. Attempt authentication multiple times (3 attempts)
4. Verify automatic fallback to password tab
5. Confirm email auto-population
6. Test successful password login

**Expected Results**:
- Fallback message appears after 3 failed attempts
- UI automatically switches to password tab
- Email field is pre-populated
- Password login functions normally

### ✅ Test B: Bioauthentication Success and Failure
**Objective**: Validate both successful and failed biometric authentication scenarios

**Test Steps**:
1. **Success Scenario**:
   - Use user with registered biometric credentials
   - Attempt biometric authentication
   - Verify success indicators (success message, redirect, etc.)

2. **Failure Scenario**:
   - Use non-existent user
   - Attempt biometric authentication
   - Verify appropriate error handling

**Expected Results**:
- Successful authentication shows success indicators
- Failed authentication shows error messages
- System remains in appropriate state

### ✅ Test C: Lockout After Multiple Failed Attempts
**Objective**: Test account security lockout mechanism

**Test Steps**:
1. Use dedicated lockout test user
2. Make multiple failed authentication attempts (5 attempts)
3. Verify account lockout activation
4. Check lockout state and disabled buttons
5. Verify appropriate lockout messages

**Expected Results**:
- Account locked after threshold (5 attempts)
- Lockout message displayed
- Authentication buttons disabled
- Security state properly maintained

### ✅ Test D: Permissions Denial Scenarios
**Objective**: Test system behavior when OS denies biometric/camera access

**Test Steps**:
1. **Biometric Permissions**:
   - Simulate WebAuthn API removal
   - Attempt biometric authentication
   - Verify error handling

2. **Camera Permissions**:
   - Simulate camera access denial
   - Attempt face authentication
   - Verify error handling

**Expected Results**:
- Appropriate error messages displayed
- System gracefully handles permission denials
- User informed of access requirements

### ✅ Test E: Network Interruption During Bioauthentication
**Objective**: Test system resilience during network issues

**Test Steps**:
1. **Network Timeout**:
   - Simulate network timeout during authentication
   - Verify timeout error handling

2. **Service Unavailable**:
   - Simulate backend service outage
   - Verify service error handling

3. **Fallback During Outage**:
   - Test password login when biometric services down
   - Verify fallback mechanism works

**Expected Results**:
- Network timeouts handled gracefully
- Service errors properly communicated
- Password fallback functional during outages

### ✅ Test F: Face ID Authentication
**Objective**: Validate facial recognition authentication system

**Test Steps**:
1. **Success Scenario**:
   - Use user with registered face credentials
   - Attempt face authentication
   - Verify success indicators

2. **Failure Scenario**:
   - Use non-existent user
   - Attempt face authentication
   - Verify error handling

**Expected Results**:
- Face authentication works with valid credentials
- Appropriate errors for invalid users
- Camera integration functional

### ✅ Test G: Comprehensive Fallback Validation
**Objective**: End-to-end validation of fallback mechanisms

**Test Steps**:
1. Test fallback from face authentication to password
2. Verify email auto-population after fallback
3. Ensure password login works after fallback
4. Validate complete fallback workflow

**Expected Results**:
- Seamless transition between authentication methods
- Consistent fallback behavior across all methods
- User experience remains smooth

## Test Data Management

### Automated Setup
The `TestDataSetup` class automatically:
- Creates test users with different credential types
- Registers biometric credentials for testing
- Registers face credentials for testing
- Manages test data lifecycle

### Test Users
- **testuser** - Basic user with password only
- **biometricuser** - User with biometric credentials
- **faceuser** - User with face credentials
- **lockoutuser** - User for lockout testing

## Running the Tests

### Prerequisites
1. **Java 17+** installed and in PATH
2. **Maven** installed (or use Maven wrapper)
3. **Frontend application** running at `http://localhost:8081`
4. **Chrome browser** installed

### Quick Start
```bash
# Navigate to test directory
cd tests/java

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=ComprehensiveBioAuthTest

# Run with custom base URL
mvn test -DbaseUrl=http://localhost:3000

# Run with specific tags
mvn test -Dgroups="critical,fallback"
```

### Maven Wrapper
```bash
# Windows
./mvnw.cmd test

# Unix/Mac
./mvnw test
```

### Test Execution Options
```bash
# Run tests in parallel
mvn test -Dparallel=true

# Run with specific browser
mvn test -Dbrowser=chrome

# Run with headless mode
mvn test -Dheadless=true

# Run with custom timeouts
mvn test -Dtimeout=30
```

## Test Configuration

### Environment Variables
```bash
# Frontend URL
baseUrl=http://localhost:8081

# Browser configuration
browser=chrome
headless=false

# Timeout settings
implicitWait=10
explicitWait=20

# Test data
testDataCleanup=true
```

### Maven Configuration
The `pom.xml` includes:
- Selenium WebDriver dependencies
- JUnit 5 testing framework
- WebDriverManager for driver management
- Surefire plugin for test execution
- Compiler settings for Java 17

## Test Results and Reporting

### Console Output
Tests provide detailed console output including:
- Test execution progress
- Success/failure indicators
- Error details and debugging information
- Test coverage summary

### Test Tags
Tests are organized with tags for selective execution:
- `@Tag("critical")` - Essential functionality tests
- `@Tag("fallback")` - Fallback mechanism tests
- `@Tag("security")` - Security and lockout tests
- `@Tag("permissions")` - Permission handling tests
- `@Tag("network")` - Network resilience tests

### Test Ordering
Tests execute in specific order using `@Order` annotations:
1. Fallback mechanism validation
2. Authentication success/failure
3. Account lockout testing
4. Permissions denial scenarios
5. Network interruption handling
6. Face ID authentication
7. Comprehensive fallback validation

## Troubleshooting

### Common Issues
1. **Element Not Found**: Verify frontend is running and accessible
2. **Timeout Errors**: Check network connectivity and frontend responsiveness
3. **Browser Issues**: Ensure Chrome is installed and up-to-date
4. **Test Data Issues**: Verify database connectivity and permissions

### Debug Mode
```bash
# Run with debug logging
mvn test -Dselenium.log.level=DEBUG

# Run single test with verbose output
mvn test -Dtest=ComprehensiveBioAuthTest#testFallbackToPassword -Dverbose=true
```

### Visual Debugging
Tests run in headful mode by default for visual debugging:
- Watch test execution in real-time
- Identify UI element issues
- Debug authentication flows

## Best Practices

### Test Design
- Use descriptive test names and documentation
- Implement proper setup and teardown
- Handle test data cleanup appropriately
- Use assertions for validation

### Maintenance
- Keep locators updated with UI changes
- Maintain test data consistency
- Regular review of test coverage
- Update tests for new features

### Performance
- Minimize unnecessary waits
- Use efficient element locators
- Implement parallel execution where possible
- Optimize test data setup

## Integration with CI/CD

### GitHub Actions
```yaml
- name: Run Selenium Tests
  run: |
    cd tests/java
    mvn test -DbaseUrl=${{ secrets.FRONTEND_URL }}
```

### Jenkins Pipeline
```groovy
stage('UI Tests') {
    steps {
        dir('tests/java') {
            sh 'mvn test -DbaseUrl=http://frontend:8081'
        }
    }
}
```

## Support and Maintenance

### Test Updates
- Update locators when UI changes
- Modify test data for new requirements
- Add tests for new features
- Maintain test coverage metrics

### Documentation
- Keep this README updated
- Document new test scenarios
- Maintain troubleshooting guides
- Update configuration examples

---

**Note**: This test suite provides comprehensive coverage of bioauthentication scenarios. All tests are designed to run automatically without manual intervention, creating and managing test data as needed.
