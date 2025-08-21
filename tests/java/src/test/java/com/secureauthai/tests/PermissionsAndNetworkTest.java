package com.secureauthai.tests;

import com.secureauthai.pages.LoginPage;
import org.junit.jupiter.api.Test;

import java.net.HttpURLConnection;
import java.net.URL;

public class PermissionsAndNetworkTest extends BaseTest {

    @Test
    void permissionsDeniedScenario() throws InterruptedException {
        LoginPage page = new LoginPage(driver, baseUrl);
        page.open();
        page.switchToFace();
        page.enterFaceUsername("demouser");

        // Without camera permission in headless CI, this typically fails quickly
        page.clickFaceAuth();
        Thread.sleep(1000);
    }

    @Test
    void networkInterruptionScenario() throws Exception {
        // Try to ping health endpoint (if backend is up). If not, continue.
        try {
            URL url = new URL("http://localhost:3001/api/health");
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setConnectTimeout(1000);
            con.setReadTimeout(1000);
            con.getResponseCode();
        } catch (Exception ignored) {}

        LoginPage page = new LoginPage(driver, baseUrl);
        page.open();
        page.enterBiometricUsername("demouser");
        page.clickBiometricAuth();
        Thread.sleep(1000);
    }
}


