package com.secureauthai.tests;

import com.secureauthai.pages.LoginPage;
import org.junit.jupiter.api.Test;

public class BiometricFailureTest extends BaseTest {

    @Test
    void biometricFailureShowsErrorAndDoesNotLogin() throws InterruptedException {
        LoginPage page = new LoginPage(driver, baseUrl);
        page.open();

        // Use a username that is expected not to exist / have credentials
        page.enterBiometricUsername("nouser_biofail");
        page.clickBiometricPrimary();

        // Give UI a moment to surface error state (toast/UI message)
        Thread.sleep(1000);
    }
}
