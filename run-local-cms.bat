@echo off
title Saleem Rishah — Local CMS
echo.
echo  Starting local CMS...
echo  Two windows will open. Keep both running.
echo  Then open: http://localhost:8080/admin/
echo.

:: Window 1: Decap CMS backend proxy (reads/writes local files)
start "Decap Server" cmd /c "npx decap-server && pause"

:: Wait 2 seconds for the proxy to start
timeout /t 2 /nobreak >nul

:: Window 2: Static file server for the site
start "Site Server" cmd /c "npx serve . -p 8080 && pause"

:: Wait 2 seconds then open the browser
timeout /t 2 /nobreak >nul
start http://localhost:8080/admin/

echo.
echo  Browser opening... Log in with any credentials (local mode).
echo  Close this window when done.
pause
