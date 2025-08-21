package com.secureauthai.tests;

import com.secureauthai.pages.LoginPage;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebElement;

public class FallbackAfterFailuresTest extends BaseTest {

    @Test
    void fallbackToPasswordAfterBiometricFailures() throws InterruptedException {
        LoginPage page = new LoginPage(driver, baseUrl);
        page.open();
        page.enterBiometricUsername("unknownuser");

        // Click biometric auth 3 times to trigger fallback
        for (int i = 0; i < 3; i++) {
            page.clickBiometricAuth();
            Thread.sleep(700);
        }

        // Switch to password and submit invalid creds
        page.switchToPassword();
        page.enterEmail("unknown@example.com");
        page.enterPassword("badpassword");
        page.submitPassword();
        Thread.sleep(800);
    }
}


