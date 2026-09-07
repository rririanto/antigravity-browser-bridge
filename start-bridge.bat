@echo off
REM Start Antigravity Browser Bridge Server for Windows
echo ====================================================
echo   Antigravity Browser Bridge - Windows Launcher
echo ====================================================

WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Node.js is not installed or not in PATH!
  echo Please install Node.js from https://nodejs.org
  pause
  exit /b 1
)

echo Starting Bridge Server on http://127.0.0.1:8765 ...
node "%~dp0bridge\server.js"
pause
