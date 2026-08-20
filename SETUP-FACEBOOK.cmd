@echo off
REM Double-click this file to finish the Facebook Page setup.
REM It walks you through it and saves both GitHub secrets for you.
REM The token is never written to disk and never shown on screen.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\setup-facebook.ps1"
