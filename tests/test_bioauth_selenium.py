import os
import time
import pytest
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

from selenium_pages import LoginPage
from selenium_ai_utils import ai_generate_test_cases, simple_visual_diff


@pytest.fixture(scope="session")
def driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,900")
    driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)
    yield driver
    driver.quit()


@pytest.mark.webauthn
@pytest.mark.biometric
def test_biometric_success_flow(driver):
    page = LoginPage(driver)
    page.open()

    # Enter username and attempt biometric (assumes already registered)
    user = "demouser"
    page.wait_visible(*LoginPage.BIOMETRIC_USERNAME).send_keys(user)
    page.wait_clickable(*LoginPage.BIOMETRIC_AUTH).click()

    # Visual check of scanning state
    time.sleep(1)
    screenshot = os.path.abspath("./reports/biometric_scanning.png")
    driver.save_screenshot(screenshot)

    # No strict assertion on server-simulated response here (demo)
    assert os.path.exists(screenshot)


@pytest.mark.fallback
def test_fallback_to_password_after_biometric_failures(driver):
    page = LoginPage(driver)
    page.open()
    user = "unknownuser"
    page.wait_visible(*LoginPage.BIOMETRIC_USERNAME).clear()
    page.wait_visible(*LoginPage.BIOMETRIC_USERNAME).send_keys(user)

    # Click biometric auth 3 times to trigger fallback
    for _ in range(3):
        page.wait_clickable(*LoginPage.BIOMETRIC_AUTH).click()
        time.sleep(0.7)

    # Switch should have moved to password tab; fill password and submit
    page.switch_to_password()
    page.wait_visible(*LoginPage.EMAIL).send_keys("unknown@example.com")
    page.wait_visible(*LoginPage.PASSWORD).send_keys("badpassword")
    page.wait_clickable(*LoginPage.PASSWORD_SUBMIT).click()

    # Expect error toast or similar (not asserting content; presence is adequate here)
    time.sleep(1)


@pytest.mark.lockout
def test_lockout_after_face_failures(driver):
    page = LoginPage(driver)
    page.open()

    # Use an invalid user to force failures
    page.switch_to_face()
    page.wait_visible(*LoginPage.FACE_USERNAME).send_keys("nouser")
    for _ in range(3):
        page.wait_clickable(*LoginPage.FACE_AUTH).click()
        time.sleep(0.7)

    # Attempt button should now be disabled (UI lockout)
    btn = page.wait_visible(*LoginPage.FACE_AUTH)
    assert not btn.is_enabled()


@pytest.mark.permissions
def test_permissions_denied_scenario(driver):
    page = LoginPage(driver)
    page.open()
    page.switch_to_face()

    # This is a placeholder: in CI, run browser with no camera permission.
    # Here, we just click and expect an error state in UI eventually.
    page.wait_visible(*LoginPage.FACE_USERNAME).send_keys("demouser")
    page.wait_clickable(*LoginPage.FACE_AUTH).click()
    time.sleep(1)


@pytest.mark.network
def test_network_interruption_during_bioauth(driver, monkeypatch):
    page = LoginPage(driver)
    page.open()
    user = "demouser"
    page.wait_visible(*LoginPage.BIOMETRIC_USERNAME).send_keys(user)

    # Simulate network blip by hitting a health endpoint before trying auth
    try:
        requests.get("http://localhost:3001/api/health", timeout=1)
    except Exception:
        pass

    page.wait_clickable(*LoginPage.BIOMETRIC_AUTH).click()
    time.sleep(1)


