@echo off
REM ==============================================================================
REM CareHealth Point – Local Security Vulnerability Scanner (Trivy & Bandit)
REM Course: DevOps & Automation Lab (ENSP461)
REM ==============================================================================

echo ==========================================================
echo  1. Scanning Python Backend Source Code with Bandit (SAST)
echo ==========================================================
cd backend
python -m pip install bandit --quiet
python -m bandit -r app/ -ll -i
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Bandit found potential security issues. Review output.
) else (
    echo [SUCCESS] Bandit SAST scan passed with 0 high-severity issues.
)
cd ..

echo.
echo ==========================================================
echo  2. Scanning Container Images with Trivy
echo ==========================================================
where trivy >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Scanning Backend Container Image (carehealthpoint-backend)...
    trivy image --severity HIGH,CRITICAL --exit-code 0 carehealthpoint-backend:latest
    echo.
    echo Scanning Frontend Container Image (carehealthpoint-frontend)...
    trivy image --severity HIGH,CRITICAL --exit-code 0 carehealthpoint-frontend:latest
) else (
    echo [NOTE] Trivy CLI is not installed locally on this host.
    echo Run via Docker: docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image carehealthpoint-backend
)

echo.
echo ==========================================================
echo  [DONE] Security scanning completed!
echo ==========================================================
