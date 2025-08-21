# Test Execution Guide - SecureAuth AI Bioauthentication Suite

## Quick Start

### Prerequisites Check
1. **Java 17+** installed and in PATH
2. **Frontend application** running at `http://localhost:8081`
3. **Chrome browser** installed
4. **Maven** installed (or use Maven wrapper)

### Run All Tests
```bash
# Windows
cd tests/java
run-tests.bat

# Unix/Linux/Mac
cd tests/java
chmod +x run-tests.sh
./run-tests.sh

# Manual execution
mvn test -DbaseUrl=http://localhost:8081
```

## Test Scenarios Coverage

### ✅ Test A: Fallback from Bioauthentication to Password
**What it tests**: System automatically switches to password login after 3 failed biometric attempts

**Expected behavior**:
- User attempts biometric authentication 3 times
- System shows fallback message
- UI automatically switches to password tab
- Email field is pre-populated
- Password login works normally

**Run individually**:
```bash
mvn test -Dtest=ComprehensiveBioAuthTest#testFallbackToPassword
```

### ✅ Test B: Bioauthentication Success and Failure
**What it tests**: Both successful and failed biometric authentication scenarios

**Expected behavior**:
- **Success**: User with valid credentials can authenticate
- **Failure**: Invalid users receive appropriate error messages
- System maintains proper state in both scenarios

**Run individually**:
```bash
mvn test -Dtest=ComprehensiveBioAuthTest#testBioauthenticationSuccessAndFailure
```

### ✅ Test C: Lockout After Multiple Failed Attempts
**What it tests**: Account security lockout mechanism

**Expected behavior**:
- Account locked after 5 failed attempts
- Lockout message displayed
- Authentication buttons disabled
- Security state properly maintained

**Run individually**:
```bash
mvn test -Dtest=ComprehensiveBioAuthTest#testLockoutAfterMultipleFailures
```

### ✅ Test D: Permissions Denial Scenarios
**What it tests**: System behavior when OS denies biometric/camera access

**Expected behavior**:
- **WebAuthn API removal**: Appropriate error handling
- **Camera access denial**: Graceful error handling
- User informed of access requirements

**Run individually**:
```bash
mvn test -Dtest=ComprehensiveBioAuthTest#testPermissionsDenial
```

### ✅ Test E: Network Interruption During Bioauthentication
**What it tests**: System resilience during network issues

**Expected behavior**:
- **Network timeout**: Graceful timeout handling
- **Service unavailable**: Proper error communication
- **Fallback during outage**: Password login works when biometric services down

**Run individually**:
```bash
mvn test -Dtest=ComprehensiveBioAuthTest#testNetworkInterruption
```

### ✅ Test F: Face ID Authentication
**What it tests**: Facial recognition authentication system

**Expected behavior**:
- **Success**: Face authentication works with valid credentials
- **Failure**: Appropriate errors for invalid users
- Camera integration functional

**Run individually**:
```bash
mvn test -Dtest=ComprehensiveBioAuthTest#testFaceIDAuthentication
```

### ✅ Test G: Comprehensive Fallback Validation
**What it tests**: End-to-end validation of fallback mechanisms

**Expected behavior**:
- Seamless transition between authentication methods
- Consistent fallback behavior across all methods
- User experience remains smooth

**Run individually**:
```bash
mvn test -Dtest=ComprehensiveBioAuthTest#testComprehensiveFallback
```

## Test Execution Options

### Run by Tags
```bash
# Critical tests only
mvn test -Dgroups="critical"

# Fallback mechanism tests
mvn test -Dgroups="fallback"

# Security tests
mvn test -Dgroups="security"

# Multiple tag combinations
mvn test -Dgroups="critical,fallback"
```

### Run by Test Class
```bash
# Comprehensive test suite
mvn test -Dtest=ComprehensiveBioAuthTest

# Test suite runner (documentation only)
mvn test -Dtest=TestSuiteRunner

# All test classes
mvn test
```

### Custom Configuration
```bash
# Custom frontend URL
mvn test -DbaseUrl=http://localhost:3000

# Custom timeouts
mvn test -Dtimeout=30

# Parallel execution
mvn test -Dparallel=true

# Headless mode
mvn test -Dheadless=true
```

## Test Data Management

### Automatic Setup
The test suite automatically:
1. Creates test users with different credential types
2. Registers biometric credentials for testing
3. Registers face credentials for testing
4. Manages test data lifecycle

### Test Users Created
- **testuser** - Basic user with password only
- **biometricuser** - User with biometric credentials
- **faceuser** - User with face credentials
- **lockoutuser** - User for lockout testing

### Manual Cleanup (if needed)
```bash
# Connect to your database and run:
DELETE FROM face_credentials WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@secureauth.ai'
);
DELETE FROM biometric_credentials WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@secureauth.ai'
);
DELETE FROM users WHERE email LIKE '%@secureauth.ai';
```

## Troubleshooting

### Common Issues

#### 1. Element Not Found
**Symptoms**: `NoSuchElementException` or `TimeoutException`
**Solutions**:
- Verify frontend is running at correct URL
- Check if UI elements have correct `data-testid` attributes
- Ensure browser is not in headless mode for debugging

#### 2. Test Data Setup Failures
**Symptoms**: Tests fail during user creation or credential registration
**Solutions**:
- Check database connectivity
- Verify RLS policies allow test operations
- Check browser console for JavaScript errors

#### 3. Authentication Failures
**Symptoms**: Biometric/face authentication doesn't work
**Solutions**:
- Ensure browser supports WebAuthn
- Check camera permissions for face authentication
- Verify test users have proper credentials

#### 4. Network/Service Issues
**Symptoms**: Tests fail due to backend unavailability
**Solutions**:
- Check if Next.js API is running
- Verify Supabase connection
- Check environment variables

### Debug Mode
```bash
# Enable debug logging
mvn test -Dselenium.log.level=DEBUG

# Run single test with verbose output
mvn test -Dtest=ComprehensiveBioAuthTest#testFallbackToPassword -Dverbose=true

# Run with custom wait times
mvn test -DimplicitWait=20 -DexplicitWait=30
```

### Visual Debugging
Tests run in headful mode by default:
- Watch test execution in real-time
- Identify UI element issues
- Debug authentication flows
- Observe fallback mechanisms

## Expected Test Results

### Success Indicators
- ✅ All tests pass without errors
- ✅ Test data created successfully
- ✅ Authentication flows work as expected
- ✅ Fallback mechanisms function properly
- ✅ Error handling works correctly

### Failure Analysis
- ❌ Element not found: Check UI selectors
- ❌ Authentication fails: Check credentials and permissions
- ❌ Network errors: Check backend services
- ❌ Test data issues: Check database connectivity

## Performance Considerations

### Test Execution Time
- **Full suite**: ~5-10 minutes
- **Individual tests**: 1-3 minutes each
- **Setup time**: ~2-3 minutes (first run only)

### Optimization Tips
- Run tests in parallel: `mvn test -Dparallel=true`
- Use headless mode for CI/CD: `mvn test -Dheadless=true`
- Reduce wait times for faster execution
- Clean up test data between runs

## Integration with CI/CD

### GitHub Actions
```yaml
- name: Run Bioauthentication Tests
  run: |
    cd tests/java
    mvn test -DbaseUrl=${{ secrets.FRONTEND_URL }} -Dheadless=true
```

### Jenkins Pipeline
```groovy
stage('Bioauthentication Tests') {
    steps {
        dir('tests/java') {
            sh 'mvn test -DbaseUrl=http://frontend:8081 -Dheadless=true'
        }
    }
}
```

### Docker
```dockerfile
FROM maven:3.9-openjdk-17
WORKDIR /app
COPY . .
RUN mvn test -DbaseUrl=http://frontend:8081 -Dheadless=true
```

## Support and Maintenance

### Test Updates
- Update locators when UI changes
- Modify test data for new requirements
- Add tests for new features
- Maintain test coverage metrics

### Documentation
- Keep this guide updated
- Document new test scenarios
- Maintain troubleshooting guides
- Update configuration examples

---

## Quick Reference Commands

```bash
# Run all tests
mvn test

# Run comprehensive suite only
mvn test -Dtest=ComprehensiveBioAuthTest

# Run with custom URL
mvn test -DbaseUrl=http://localhost:3000

# Run specific test
mvn test -Dtest=ComprehensiveBioAuthTest#testFallbackToPassword

# Run by tags
mvn test -Dgroups="critical,fallback"

# Debug mode
mvn test -Dselenium.log.level=DEBUG

# Windows batch file
run-tests.bat

# Unix/Linux shell script
./run-tests.sh
```

**Note**: This test suite provides comprehensive coverage of all required bioauthentication scenarios. All tests are designed to run automatically without manual intervention, creating and managing test data as needed.
