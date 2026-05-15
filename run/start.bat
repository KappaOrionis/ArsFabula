@echo off
REM ArsFabula Launch Wrapper
pushd "%~dp0.."
powershell -ExecutionPolicy Bypass -File "run\scripts\start.ps1"
popd
pause
