@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules\vite" (
  echo Installing dependencies, please wait...
  call npm install
  if errorlevel 1 goto err
)

echo Starting dev server...
echo The browser will open http://localhost:5173
call npm run dev -- --open
goto end

:err
echo.
echo Install failed. See README.md
pause

:end
