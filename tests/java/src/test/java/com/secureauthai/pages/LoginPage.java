package com.secureauthai.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

public class LoginPage {
    private final WebDriver driver;
    private final WebDriverWait wait;
    private final String baseUrl;

    // Tabs
    private static final By TAB_BIOMETRIC = By.xpath("//button[@data-state and .//span[text()='Biometric']]");
    private static final By TAB_PASSWORD = By.xpath("//button[@data-state and .//span[text()='Password']]");
    private static final By TAB_FACE = By.xpath("//button[@data-state and .//span[text()='Face']]");

    // Biometric
    public static final By BIOMETRIC_USERNAME = By.id("biometric-username");
    public static final By BIOMETRIC_REGISTER = By.cssSelector("[data-testid='biometric-register-button']");
    public static final By BIOMETRIC_AUTH = By.cssSelector("[data-testid='biometric-auth-button']");

    // Face
    public static final By FACE_USERNAME = By.id("face-username");
    public static final By FACE_REGISTER = By.cssSelector("[data-testid='face-register-button']");
    public static final By FACE_AUTH = By.cssSelector("[data-testid='face-auth-button']");

    // Password
    private static final By EMAIL = By.id("email");
    private static final By PASSWORD = By.id("password");
    private static final By PASSWORD_SUBMIT = By.cssSelector("[data-testid='password-login-button']");
    
    // Status elements
    private static final By BIOMETRIC_SCANNING = By.xpath("//p[text()='Scanning biometric data...']");
    private static final By AUTH_SUCCESS = By.xpath("//p[text()='Authentication successful!']");
    private static final By AUTH_ERROR = By.xpath("//p[text()='Authentication failed']");
    private static final By LOCKOUT_MESSAGE = By.xpath("//div[contains(text(), 'locked due to multiple failed attempts')]");
    private static final By FALLBACK_MESSAGE = By.xpath("//div[contains(text(), 'Too many attempts')]");
    
    // Registration navigation
    private static final By REGISTER_LINK = By.xpath("//button[contains(text(), 'Create one here')]");
    private static final By LOGIN_LINK = By.xpath("//button[contains(text(), 'Sign in here')]");
    
    // Registration page elements
    private static final By REG_EMAIL = By.id("email");
    private static final By REG_USERNAME = By.id("username");
    private static final By REG_PASSWORD = By.id("password");
    private static final By REG_CONFIRM_PASSWORD = By.id("confirm-password");
    private static final By REG_BIOMETRIC_CHECKBOX = By.xpath("//div[contains(@class, 'flex items-center space-x-2')]//button");
    private static final By REG_ACCOUNT_BUTTON = By.cssSelector("[data-testid='account-register-button']");
    private static final By REG_BIOMETRIC_REGISTER_BUTTON = By.cssSelector("[data-testid='biometric-register-button']");
    private static final By REG_FACE_REGISTER_BUTTON = By.cssSelector("[data-testid='face-register-button']");
    
    // Registration tabs
    private static final By REG_TAB_ACCOUNT = By.xpath("//button[@data-state and .//span[text()='Account']]");
    private static final By REG_TAB_BIOMETRIC = By.xpath("//button[@data-state and .//span[text()='Biometric']]");
    private static final By REG_TAB_FACE = By.xpath("//button[@data-state and .//span[text()='Face']]");

    public LoginPage(WebDriver driver, String baseUrl) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        this.baseUrl = baseUrl;
    }

    public void open() {
        driver.get(baseUrl);
        wait.until(ExpectedConditions.or(
                ExpectedConditions.visibilityOfElementLocated(TAB_BIOMETRIC),
                ExpectedConditions.visibilityOfElementLocated(TAB_PASSWORD)
        ));
    }

    public void switchToPassword() { 
        wait.until(ExpectedConditions.elementToBeClickable(TAB_PASSWORD)).click(); 
        // Wait for the password tab content to be visible
        wait.until(ExpectedConditions.visibilityOfElementLocated(EMAIL));
    }
    
    public void switchToBiometric() { 
        wait.until(ExpectedConditions.elementToBeClickable(TAB_BIOMETRIC)).click();
        // Wait for the biometric tab content to be visible
        wait.until(ExpectedConditions.visibilityOfElementLocated(BIOMETRIC_USERNAME));
    }
    
    public void switchToFace() { 
        wait.until(ExpectedConditions.elementToBeClickable(TAB_FACE)).click();
        // Wait for the face tab content to be visible
        wait.until(ExpectedConditions.visibilityOfElementLocated(FACE_USERNAME));
    }

    public void enterBiometricUsername(String user) {
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(BIOMETRIC_USERNAME));
        el.clear();
        el.sendKeys(user);
    }

    public void clickBiometricAuth() { wait.until(ExpectedConditions.elementToBeClickable(BIOMETRIC_AUTH)).click(); }

    public boolean isPresent(By locator) {
        try {
            driver.findElement(locator);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public void clickBiometricPrimary() {
        if (isPresent(BIOMETRIC_AUTH)) {
            clickBiometricAuth();
        } else if (isPresent(BIOMETRIC_REGISTER)) {
            wait.until(ExpectedConditions.elementToBeClickable(BIOMETRIC_REGISTER)).click();
        } else {
            throw new RuntimeException("No biometric action button present");
        }
    }

    public void enterFaceUsername(String user) {
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(FACE_USERNAME));
        el.clear();
        el.sendKeys(user);
    }

    public WebElement faceAuthButton() { return wait.until(ExpectedConditions.visibilityOfElementLocated(FACE_AUTH)); }
    public void clickFaceAuth() { wait.until(ExpectedConditions.elementToBeClickable(FACE_AUTH)).click(); }

    public void clickFacePrimary() {
        if (isPresent(FACE_AUTH)) {
            clickFaceAuth();
        } else if (isPresent(FACE_REGISTER)) {
            wait.until(ExpectedConditions.elementToBeClickable(FACE_REGISTER)).click();
        } else {
            throw new RuntimeException("No face action button present");
        }
    }

    public void enterEmail(String email) {
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(EMAIL));
        el.clear();
        el.sendKeys(email);
    }
    public void enterPassword(String pass) {
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(PASSWORD));
        el.clear();
        el.sendKeys(pass);
    }
    
    public void submitPassword() { wait.until(ExpectedConditions.elementToBeClickable(PASSWORD_SUBMIT)).click(); }
    
    // Status checking methods
    public boolean isScanningVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(BIOMETRIC_SCANNING)) != null;
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean isAuthSuccessVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(AUTH_SUCCESS)) != null;
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean isAuthErrorVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(AUTH_ERROR)) != null;
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean isLockedOut() {
        try {
            driver.findElement(LOCKOUT_MESSAGE);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean isFallbackMessageVisible() {
        try {
            driver.findElement(FALLBACK_MESSAGE);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean isButtonDisabled(By locator) {
        try {
            WebElement element = driver.findElement(locator);
            return !element.isEnabled() || element.getAttribute("disabled") != null;
        } catch (Exception e) {
            return false;
        }
    }
    
    public void waitForElement(By locator, int timeoutSeconds) {
        WebDriverWait customWait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        customWait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }
    
    public void waitForElementToBeClickable(By locator, int timeoutSeconds) {
        WebDriverWait customWait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        customWait.until(ExpectedConditions.elementToBeClickable(locator));
    }
    
    // Registration page methods
    public void clickRegisterLink() {
        wait.until(ExpectedConditions.elementToBeClickable(REGISTER_LINK)).click();
        // Wait for registration page to load
        wait.until(ExpectedConditions.visibilityOfElementLocated(REG_EMAIL));
    }
    
    public void fillRegistrationForm(String email, String username, String password) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(REG_EMAIL)).sendKeys(email);
        wait.until(ExpectedConditions.visibilityOfElementLocated(REG_USERNAME)).sendKeys(username);
        wait.until(ExpectedConditions.visibilityOfElementLocated(REG_PASSWORD)).sendKeys(password);
        wait.until(ExpectedConditions.visibilityOfElementLocated(REG_CONFIRM_PASSWORD)).sendKeys(password);
    }
    
    public void checkBiometricRegistrationOption() {
        wait.until(ExpectedConditions.elementToBeClickable(REG_BIOMETRIC_CHECKBOX)).click();
    }
    
    public void submitRegistration() {
        wait.until(ExpectedConditions.elementToBeClickable(REG_ACCOUNT_BUTTON)).click();
    }
    
    public void switchToRegistrationBiometricTab() {
        wait.until(ExpectedConditions.elementToBeClickable(REG_TAB_BIOMETRIC)).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(REG_BIOMETRIC_REGISTER_BUTTON));
    }
    
    public void switchToRegistrationFaceTab() {
        wait.until(ExpectedConditions.elementToBeClickable(REG_TAB_FACE)).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(REG_FACE_REGISTER_BUTTON));
    }
    
    public void clickRegistrationBiometricRegister() {
        wait.until(ExpectedConditions.elementToBeClickable(REG_BIOMETRIC_REGISTER_BUTTON)).click();
    }
    
    public void clickRegistrationFaceRegister() {
        wait.until(ExpectedConditions.elementToBeClickable(REG_FACE_REGISTER_BUTTON)).click();
    }
    
    public boolean isRegistrationSuccessful() {
        try {
            // Look for success indicators - either success animation or redirect
            return wait.until(ExpectedConditions.or(
                ExpectedConditions.visibilityOfElementLocated(AUTH_SUCCESS),
                ExpectedConditions.urlContains("dashboard"),
                ExpectedConditions.visibilityOfElementLocated(By.xpath("//p[text()='Registration successful!']"))
            )) != null;
        } catch (Exception e) {
            return false;
        }
    }
    
    // Navigation methods
    public void navigateBackToLogin() {
        if (isPresent(LOGIN_LINK)) {
            wait.until(ExpectedConditions.elementToBeClickable(LOGIN_LINK)).click();
        } else {
            // If no login link, navigate to base URL
            driver.get(baseUrl);
        }
        wait.until(ExpectedConditions.visibilityOfElementLocated(TAB_BIOMETRIC));
    }
    
    // Check if biometric button text changed to authenticate
    public boolean isAuthenticateButtonPresent() {
        return isPresent(BIOMETRIC_AUTH);
    }
    
    public boolean isRegisterButtonPresent() {
        return isPresent(BIOMETRIC_REGISTER);
    }
    
    public String getBiometricButtonText() {
        try {
            if (isPresent(BIOMETRIC_AUTH)) {
                return driver.findElement(BIOMETRIC_AUTH).getText();
            } else if (isPresent(BIOMETRIC_REGISTER)) {
                return driver.findElement(BIOMETRIC_REGISTER).getText();
            }
        } catch (Exception e) {
            // Ignore
        }
        return "";
    }
    
    // Check if email is auto-populated after biometric failures
    public boolean isEmailAutopopulated() {
        try {
            WebElement emailField = driver.findElement(EMAIL);
            return !emailField.getAttribute("value").isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
    
    public String getAutopopulatedEmail() {
        try {
            return driver.findElement(EMAIL).getAttribute("value");
        } catch (Exception e) {
            return "";
        }
    }
}


