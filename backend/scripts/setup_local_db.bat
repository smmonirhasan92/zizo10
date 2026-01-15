@echo off
echo ===========================================
echo   Local Sandbox Database Setup
echo ===========================================
echo.
echo [1/3] Checking XAMPP MySQL...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Could not connect to MySQL. 
    echo    Please start XAMPP MySQL module and try again.
    pause
    exit /b 1
)
echo ✅ MySQL is running.

echo.
echo [2/3] Creating Database 'walet_game_local'...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS walet_game_local;"
if %errorlevel% neq 0 (
    echo ❌ Failed to create database.
    pause
    exit /b 1
)
echo ✅ Database ready.

echo.
echo [3/3] Importing Production Data (zizocom_data-01.sql)...
echo    This may take a moment...
"C:\xampp\mysql\bin\mysql.exe" -u root walet_game_local < "d:\zizo10\zizocom_data-01.sql"
if %errorlevel% neq 0 (
    echo ❌ Import failed.
    pause
    exit /b 1
)
echo ✅ Data successfully imported!

echo.
echo ===========================================
echo   SETUP COMPLETE!
echo   Your Local Sandbox is ready.
echo ===========================================
pause
