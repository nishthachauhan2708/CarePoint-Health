@echo off
REM ==============================================================================
REM CareHealth Point – Test Execution Suite
REM Course: DevOps & Automation Lab (ENSP461)
REM ==============================================================================

echo ==========================================================
echo  1. Running Backend Automated Tests (Pytest)
echo ==========================================================
cd backend
python -m pytest tests/ -v
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Backend test suite failed.
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================================
echo  2. Building Frontend Production Bundle
echo ==========================================================
cd ..\frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Frontend build failed.
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================================
echo  [SUCCESS] All Backend Tests and Frontend Builds PASSED!
echo ==========================================================
cd ..
