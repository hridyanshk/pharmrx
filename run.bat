@echo off
title Remix PharmRx Launcher

:: Anchor to the script's directory
cd /d "%~dp0"

:: Locate Node.js, including the runtime bundled with Codex.
set "APP_NODE="
for /f "delims=" %%N in ('where node.exe 2^>nul') do if not defined APP_NODE set "APP_NODE=%%N"
if not defined APP_NODE if exist "C:\Program Files\nodejs\node.exe" set "APP_NODE=C:\Program Files\nodejs\node.exe"
if not defined APP_NODE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "APP_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined APP_NODE (
    echo Node.js could not be found. Install Node.js LTS, then run this launcher again.
    pause
    exit /b 1
)
for %%N in ("%APP_NODE%") do set "PATH=%%~dpN;%PATH%"

if not exist "frontend\node_modules\vite\bin\vite.js" (
    echo Frontend dependencies are missing. Install them before starting the app.
    pause
    exit /b 1
)

echo [1/3] Starting Backend Server...
cd backend
powershell -NoProfile -Command "try { $r = Invoke-RestMethod 'http://localhost:5000/api/clinical/health' -TimeoutSec 2; if ($r.connected) { exit 0 }; exit 1 } catch { exit 1 }"
if errorlevel 1 start "PharmRx Backend" cmd /k ""%APP_NODE%" server.js"
cd ..

echo [2/3] Starting Frontend Server...
cd frontend
powershell -NoProfile -Command "try { $r = Invoke-WebRequest 'http://localhost:3000' -UseBasicParsing -TimeoutSec 2; if ($r.Content -match 'PharmRx') { exit 0 }; exit 1 } catch { exit 1 }"
if errorlevel 1 start "PharmRx Frontend" cmd /k ""%APP_NODE%" node_modules\vite\bin\vite.js --port=3000 --strictPort --host=127.0.0.1"
cd ..

echo [3/3] Launching Remix PharmRx in browser...
timeout /t 5 /nobreak > nul
start http://localhost:3000

exit
