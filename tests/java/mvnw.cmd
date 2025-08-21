@ECHO OFF
setlocal

set WRAPPER_JAR=.mvn\wrapper\maven-wrapper.jar
set WRAPPER_PROPERTIES=.mvn\wrapper\maven-wrapper.properties

set DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"

IF NOT EXIST "%WRAPPER_JAR%" (
  echo Downloading Maven Wrapper...
  if exist .mvn\wrapper (echo.) else (mkdir .mvn\wrapper)
  powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile(%DOWNLOAD_URL%, '%WRAPPER_JAR%')"
)

java -classpath %WRAPPER_JAR% org.apache.maven.wrapper.MavenWrapperMain %*

endlocal

