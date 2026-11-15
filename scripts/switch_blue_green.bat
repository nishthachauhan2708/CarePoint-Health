@echo off
REM ==============================================================================
REM CareHealth Point – Blue/Green Traffic Router (Windows)
REM Course: DevOps & Automation Lab (ENSP461)
REM ==============================================================================

set TARGET=%1
if "%TARGET%"=="" set TARGET=green

echo ==========================================================
echo  CareHealth Point - Blue/Green Traffic Switch
echo  Target Environment: %TARGET%
echo ==========================================================

kubectl patch service carehealth-backend-active-service -n carehealth -p "{\"spec\":{\"selector\":{\"version\":\"%TARGET%\"}}}"

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Live traffic successfully switched to %TARGET%!
    echo Verify with: kubectl get endpoints carehealth-backend-active-service -n carehealth
) else (
    echo [ERROR] Failed to switch traffic. Check cluster connectivity.
)
