# ArsFabula - Setup Script (Windows PowerShell)
# This script verifies dependencies and installs necessary packages.

$ErrorActionPreference = "Stop"

Write-Host "--- ArsFabula Setup ---" -ForegroundColor Cyan

# 1. Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "[OK] Node.js is installed ($nodeVersion)" -ForegroundColor Green
} catch {
    Write-Error "Node.js is not installed. Please download it from https://nodejs.org/"
}

# 2. Check Rust
# Check if cargo is in PATH, if not try to find it in default home location
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    $cargoPath = "$HOME\.cargo\bin"
    if (Test-Path "$cargoPath\cargo.exe") {
        $env:PATH += ";$cargoPath"
        Write-Host "[OK] Cargo found in $cargoPath and added to session PATH" -ForegroundColor Yellow
    }
}

try {
    $cargoVersion = cargo --version
    Write-Host "[OK] Rust/Cargo is installed ($cargoVersion)" -ForegroundColor Green
} catch {
    Write-Error "Rust is not installed. Please install it from https://rustup.rs/"
}

# 3. Check Python
try {
    $pythonVersion = python --version
    Write-Host "[OK] Python is installed ($pythonVersion)" -ForegroundColor Green
} catch {
    Write-Error "Python is not installed. Please install Python 3.11+."
}

# 4. Check LM Studio (Port 1234)
$tcpConnection = Test-NetConnection -ComputerName localhost -Port 1234 -ErrorAction SilentlyContinue
if ($tcpConnection.TcpTestSucceeded) {
    Write-Host "[OK] LM Studio is running on port 1234" -ForegroundColor Green
} else {
    Write-Host "[WARN] LM Studio is not detected on port 1234. Please launch it and start the server." -ForegroundColor Yellow
}

Write-Host "`n--- Installing Dependencies ---" -ForegroundColor Cyan

# Install NPM dependencies
Write-Host "Installing Frontend dependencies..."
npm install

# Install Python dependencies
Write-Host "Installing Python RAG dependencies..."
if (Test-Path "python\venv") {
    Write-Host "Using existing virtual environment."
} else {
    python -m venv python\venv
}
.\python\venv\Scripts\python.exe -m pip install -r python\requirements.txt

# Rust dependencies
Write-Host "Fetching Rust dependencies..."
cd src-tauri
cargo fetch
cd ..

Write-Host "`n--- Setup Complete ---" -ForegroundColor Cyan
Write-Host "You can now run the app with: ./run/start.ps1"
