package com.secureauthai.tests;

import com.secureauthai.pages.LoginPage;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebElement;

public class FaceLockoutTest extends BaseTest {

    @Test
    void faceLockoutAfterThreeFailures() throws InterruptedException {
        LoginPage page = new LoginPage(driver, baseUrl);
        page.open();
        page.switchToFace();
        page.enterFaceUsername("nouser");

        for (int i = 0; i < 3; i++) {
            page.clickFaceAuth();
            Thread.sleep(700);
        }

        WebElement button = page.faceAuthButton();
        Assertions.assertFalse(button.isEnabled(), "Face auth button should be disabled after 3 failures");
    }
}


