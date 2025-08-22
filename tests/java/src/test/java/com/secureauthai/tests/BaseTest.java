package com.secureauthai.tests;

import com.secureauthai.pages.LoginPage;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.JavascriptExecutor;
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
        // Allow insecure localhost for WebAuthn testing
        options.addArguments("--allow-running-insecure-content");
        options.addArguments("--disable-web-security");
        options.addArguments("--ignore-certificate-errors");
        // Enable media devices for face recognition testing
        options.addArguments("--use-fake-ui-for-media-stream");
        options.addArguments("--use-fake-device-for-media-stream");
        
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
        
        // Inject test initialization script
        injectTestScript();
    }
    
    private void injectTestScript() {
        try {
            // Navigate to the page first
            driver.get(baseUrl);
            Thread.sleep(1000);
            
            // Execute script to set up test environment
            String script = """
                // Enable test mode
                window.__SELENIUM_TEST_MODE__ = true;
                
                // Mock camera access for Face ID
                if (navigator.mediaDevices) {
                  const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
                  
                  navigator.mediaDevices.getUserMedia = async function(constraints) {
                    console.log('🧪 Mock camera access granted for Selenium tests');
                    
                    // Create a mock video stream
                    const canvas = document.createElement('canvas');
                    canvas.width = 640;
                    canvas.height = 480;
                    const ctx = canvas.getContext('2d');
                    
                    if (ctx) {
                      ctx.fillStyle = '#f0c674';
                      ctx.fillRect(0, 0, 640, 480);
                      ctx.fillStyle = '#000000';
                      ctx.fillRect(200, 150, 60, 60);
                      ctx.fillRect(380, 150, 60, 60);
                      ctx.fillRect(280, 280, 80, 40);
                    }
                    
                    const stream = canvas.captureStream(30);
                    return Promise.resolve(stream);
                  };
                }
                
                // Override PublicKeyCredential availability
                if (window.PublicKeyCredential) {
                  window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = async function() {
                    console.log('🧪 Mock: Biometric authenticator available');
                    return true;
                  };
                }
                
                // Add visual indicator
                const indicator = document.createElement('div');
                indicator.innerHTML = '🧪 TEST MODE - Biometrics Mocked';
                indicator.style.cssText = 'position:fixed;top:0;right:0;background:#ff6b6b;color:white;padding:5px;z-index:9999;font-size:12px;';
                document.body.appendChild(indicator);
                
                console.log('✅ Selenium test mode initialized with biometric mocks');
                """;
            
            ((org.openqa.selenium.JavascriptExecutor) driver).executeScript(script);
            
        } catch (Exception e) {
            System.err.println("Warning: Could not inject test script: " + e.getMessage());
        }
    }

    @AfterEach
    void stop() {
        if (driver != null) {
            driver.quit();
        }
    }
}


