package com.secureauthai.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginPage {
    private final WebDriver driver;
    private final WebDriverWait wait;
    private final String baseUrl;

    // Tabs
    private static final By TAB_BIOMETRIC = By.xpath("//button[.//span[text()='Biometric']]");
    private static final By TAB_PASSWORD = By.xpath("//button[.//span[text()='Password']]");
    private static final By TAB_FACE = By.xpath("//button[.//span[text()='Face']]");

    // Biometric
    private static final By BIOMETRIC_USERNAME = By.id("biometric-username");
    private static final By BIOMETRIC_REGISTER = By.cssSelector("[data-testid='biometric-register-button']");
    private static final By BIOMETRIC_AUTH = By.cssSelector("[data-testid='biometric-auth-button']");

    // Face
    private static final By FACE_USERNAME = By.id("face-username");
    private static final By FACE_REGISTER = By.cssSelector("[data-testid='face-register-button']");
    private static final By FACE_AUTH = By.cssSelector("[data-testid='face-auth-button']");

    // Password
    private static final By EMAIL = By.id("email");
    private static final By PASSWORD = By.id("password");
    private static final By PASSWORD_SUBMIT = By.cssSelector("[data-testid='password-login-button']");

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

    public void switchToPassword() { wait.until(ExpectedConditions.elementToBeClickable(TAB_PASSWORD)).click(); }
    public void switchToBiometric() { wait.until(ExpectedConditions.elementToBeClickable(TAB_BIOMETRIC)).click(); }
    public void switchToFace() { wait.until(ExpectedConditions.elementToBeClickable(TAB_FACE)).click(); }

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
}


