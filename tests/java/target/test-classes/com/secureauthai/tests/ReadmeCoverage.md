# Test Coverage (Selenium Java)

Scenarios:
- Fallback from bioauthentication to password: `FallbackAfterFailuresTest`
- Biometric success: `BiometricSuccessTest`
- Biometric failure: `BiometricFailureTest`
- Lockout after multiple failed face attempts: `FaceLockoutTest`
- Permissions denial (camera in headless): `PermissionsAndNetworkTest#permissionsDeniedScenario`
- Network interruption: `PermissionsAndNetworkTest#networkInterruptionScenario`

Run:
```bash
mvn -q -f tests/java/pom.xml test -DbaseUrl=http://localhost:5173
```
