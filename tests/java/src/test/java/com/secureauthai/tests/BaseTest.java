package com.secureauthai.tests;

import com.secureauthai.pages.LoginPage;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

public abstract class BaseTest {
    protected WebDriver driver;
    protected String baseUrl;
    protected LoginPage loginPage;

    @BeforeAll
    static void setupDriver() {
        WebDriverManager.chromedriver().setup();
    }

    @BeforeEach
    void start() {
        ChromeOptions options = new ChromeOptions();
        // Run headful (not headless) and at a decent size for visibility
        options.addArguments("--window-size=1440,900");
        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        String configured = System.getProperty("baseUrl");
        if (configured == null || configured.trim().isEmpty()) {
            String env = System.getenv("BASE_URL");
            if (env == null || env.trim().isEmpty()) {
                baseUrl = "http://localhost:8081"; // default
            } else {
                baseUrl = env.trim();
            }
        } else {
            baseUrl = configured.trim();
        }
        
        // Initialize LoginPage
        loginPage = new LoginPage(driver, baseUrl);
    }

    @AfterEach
    void stop() {
        if (driver != null) {
            driver.quit();
        }
    }
}


