# ArsFabula - Launch Script (Windows PowerShell)

Write-Host "--- Starting ArsFabula ---" -ForegroundColor Cyan

# Check if LM Studio is reachable
$tcpConnection = Test-NetConnection -ComputerName localhost -Port 1234 -ErrorAction SilentlyContinue
if (-not $tcpConnection.TcpTestSucceeded) {
    Write-Host "[!] LM Studio not detected on port 1234." -ForegroundColor Red
    Write-Host "Please launch LM Studio and click 'Start Server' before proceeding." -ForegroundColor Yellow
    $confirm = Read-Host "Proceed anyway? (y/n)"
    if ($confirm -ne "y") { exit }
}

Write-Host "Launching dev environment..." -ForegroundColor Green
npm run dev
