from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class BasePage:
    def __init__(self, driver, timeout: int = 15):
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)

    def wait_visible(self, by, locator):
        return self.wait.until(EC.visibility_of_element_located((by, locator)))

    def wait_clickable(self, by, locator):
        return self.wait.until(EC.element_to_be_clickable((by, locator)))


class LoginPage(BasePage):
    URL = "http://localhost:5173"  # adjust if different

    # Tabs
    TAB_BIOMETRIC = (By.XPATH, "//button[.//span[text()='Biometric']]")
    TAB_PASSWORD = (By.XPATH, "//button[.//span[text()='Password']]")
    TAB_FACE = (By.XPATH, "//button[.//span[text()='Face']]")

    # Biometric elements
    BIOMETRIC_USERNAME = (By.ID, "biometric-username")
    BIOMETRIC_REGISTER = (By.CSS_SELECTOR, "[data-testid='biometric-register-button']")
    BIOMETRIC_AUTH = (By.CSS_SELECTOR, "[data-testid='biometric-auth-button']")

    # Face elements
    FACE_USERNAME = (By.ID, "face-username")
    FACE_REGISTER = (By.CSS_SELECTOR, "[data-testid='face-register-button']")
    FACE_AUTH = (By.CSS_SELECTOR, "[data-testid='face-auth-button']")

    # Password elements
    EMAIL = (By.ID, "email")
    PASSWORD = (By.ID, "password")
    PASSWORD_SUBMIT = (By.CSS_SELECTOR, "[data-testid='password-login-button']")

    def open(self):
        self.driver.get(self.URL)
        self.wait_visible(*self.TAB_BIOMETRIC)

    def switch_to_password(self):
        self.wait_clickable(*self.TAB_PASSWORD).click()

    def switch_to_biometric(self):
        self.wait_clickable(*self.TAB_BIOMETRIC).click()

    def switch_to_face(self):
        self.wait_clickable(*self.TAB_FACE).click()


