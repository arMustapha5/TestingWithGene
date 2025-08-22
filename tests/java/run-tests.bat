@echo off
echo ========================================
echo SecureAuth AI - Test Suite Runner
echo ========================================
echo.

echo Starting comprehensive bioauthentication test suite...
echo.

REM Check if Java is available
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17+ and add it to your system PATH
    pause
    exit /b 1
)

REM Check if Maven is available
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Maven not found, using Maven wrapper...
    if exist "mvnw.cmd" (
        echo Using Maven wrapper...
        call mvnw.cmd test -DbaseUrl=http://localhost:8081
    ) else (
        echo ERROR: Neither Maven nor Maven wrapper found
        echo Please install Maven or ensure mvnw.cmd is present
        pause
        exit /b 1
    )
) else (
    echo Using system Maven...
    mvn test -DbaseUrl=http://localhost:8081
)

echo.
echo ========================================
echo Test execution completed
echo ========================================
pause
