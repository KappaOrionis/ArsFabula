# ArsFabula - Launch Script (Windows PowerShell)
# Robust detection of Rust, Cargo, and MSVC Build Tools

Write-Host "--- Starting ArsFabula ---" -ForegroundColor Cyan

# 1. Resolve Cargo Path
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    $cargoPath = "$env:USERPROFILE\.cargo\bin"
    if (Test-Path $cargoPath) {
        $env:PATH = "$cargoPath;$env:PATH"
        Write-Host "[+] Cargo added to PATH" -ForegroundColor Gray
    } else {
        Write-Host "[!] Cargo not found. Please install Rust from https://rustup.rs" -ForegroundColor Red
        exit
    }
}

# 2. Resolve MSVC Linker (link.exe)
if (-not (Get-Command link -ErrorAction SilentlyContinue) -or (Get-Command link).Source -like "*Git*") {
    Write-Host "[*] Searching for MSVC Linker..." -ForegroundColor Gray
    $vsPath = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools"
    if (Test-Path $vsPath) {
        $msvcBase = Join-Path $vsPath "VC\Tools\MSVC"
        if (Test-Path $msvcBase) {
            $latestVersion = Get-ChildItem $msvcBase | Sort-Object Name -Descending | Select-Object -First 1
            $linkerPath = Join-Path $msvcBase "$($latestVersion.Name)\bin\Hostx64\x64"
            if (Test-Path $linkerPath) {
                $env:PATH = "$linkerPath;$env:PATH"
                Write-Host "[+] MSVC Linker added to PATH: $($latestVersion.Name)" -ForegroundColor Gray
            }
        }
    }
}

# 3. Check if LM Studio is reachable
$tcpConnection = Test-NetConnection -ComputerName 127.0.0.1 -Port 1234 -ErrorAction SilentlyContinue
if (-not $tcpConnection.TcpTestSucceeded) {
    Write-Host "[!] LM Studio not detected on port 1234." -ForegroundColor Red
    Write-Host "Please launch LM Studio and click 'Start Server' before proceeding." -ForegroundColor Yellow
    $confirm = Read-Host "Proceed anyway? (y/n)"
    if ($confirm -ne "y") { exit }
}

Write-Host "Cleaning up port 5173..." -ForegroundColor Gray
$process = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
}

Write-Host "Launching dev environment (Port 5173)..." -ForegroundColor Green
npm run tauri dev
