@echo off
REM ArsFabula Setup Wrapper
pushd "%~dp0.."
powershell -ExecutionPolicy Bypass -File "run\scripts\setup.ps1"
popd
pause
