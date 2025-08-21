#!/bin/bash

echo "========================================"
echo "SecureAuth AI - Test Suite Runner"
echo "========================================"
echo

echo "Starting comprehensive bioauthentication test suite..."
echo

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed or not in PATH"
    echo "Please install Java 17+ and add it to your system PATH"
    exit 1
fi

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "ERROR: Java 17+ is required, found version $JAVA_VERSION"
    exit 1
fi

echo "Java version: $(java -version 2>&1 | head -n 1)"

# Check if Maven is available
if ! command -v mvn &> /dev/null; then
    echo "WARNING: Maven not found, using Maven wrapper..."
    if [ -f "./mvnw" ]; then
        echo "Using Maven wrapper..."
        chmod +x ./mvnw
        ./mvnw test -DbaseUrl=http://localhost:8081
    else
        echo "ERROR: Neither Maven nor Maven wrapper found"
        echo "Please install Maven or ensure mvnw is present"
        exit 1
    fi
else
    echo "Using system Maven..."
    mvn test -DbaseUrl=http://localhost:8081
fi

echo
echo "========================================"
echo "Test execution completed"
echo "========================================"
