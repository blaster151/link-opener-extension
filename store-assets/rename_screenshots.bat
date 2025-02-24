@echo off
echo Running Link Lasso Screenshot Renaming Tool...
echo.

:: Run PowerShell script with bypass execution policy
powershell -ExecutionPolicy Bypass -File "%~dp0rename_screenshots.ps1"

echo.
pause 