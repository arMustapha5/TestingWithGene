package com.secureauthai.tests;

import com.secureauthai.pages.LoginPage;
import org.junit.jupiter.api.Test;

public class BiometricSuccessTest extends BaseTest {

    @Test
    void biometricSuccess() throws InterruptedException {
        LoginPage page = new LoginPage(driver, baseUrl);
        page.open();
        page.enterBiometricUsername("kaycy");
        page.clickBiometricPrimary();
        Thread.sleep(1000); // observe scanning UI; backend sim decides success
    }
}


