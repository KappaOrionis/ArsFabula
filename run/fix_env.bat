@echo off
SETLOCAL EnableDelayedExpansion

echo --- ArsFabula Environment Repair ---

REM 1. Search for compatible Python (3.12 or 3.11)
echo Checking for Python 3.12...
py -3.12 --version >nul 2>&1
if %ERRORLEVEL% == 0 (
    set PYTHON_EXE=py -3.12
    echo [OK] Found Python 3.12
) else (
    echo Checking for Python 3.11...
    py -3.11 --version >nul 2>&1
    if %ERRORLEVEL% == 0 (
        set PYTHON_EXE=py -3.11
        echo [OK] Found Python 3.11
    ) else (
        echo [!] No compatible Python (3.11 or 3.12) found via 'py' launcher.
        echo Please ensure Python 3.12 is installed correctly.
        pause
        exit /b 1
    )
)

REM 2. Setup Venv
echo.
echo --- Setting up Virtual Environment ---
if exist python\venv (
    echo Removing old virtual environment...
    rmdir /s /q python\venv
)
echo Creating new venv with %PYTHON_EXE%...
%PYTHON_EXE% -m venv python\venv

if not exist python\venv\Scripts\python.exe (
    echo [!] Failed to create virtual environment.
    pause
    exit /b 1
)

echo.
echo --- Installing Requirements ---
python\venv\Scripts\python.exe -m pip install --upgrade pip
python\venv\Scripts\python.exe -m pip install -r python\requirements.txt

REM 3. Try to find Cargo
echo.
echo --- Searching for Cargo ---
where cargo >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OK] Cargo is already in PATH.
) else (
    if exist "%USERPROFILE%\.cargo\bin\cargo.exe" (
        echo [OK] Found Cargo in %USERPROFILE%\.cargo\bin
        echo NOTE: This script will add it to the PATH for the CURRENT session only.
        set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
    ) else (
        echo [!] Cargo not found in default location. 
        echo Please ensure Rust is installed from https://rustup.rs/
    )
)

echo.
echo --- Repair Complete ---
echo You can now run 'run\setup.bat' or 'run\start.bat'.
pause
