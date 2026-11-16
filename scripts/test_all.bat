@echo off
REM ==============================================================================
REM CareHealth Point – Master Automated Test & Validation Runner
REM Course: DevOps & Automation Lab (ENSP461)
REM ==============================================================================

echo ==========================================================
echo  1. Running Backend Automated Pytest Suite
echo ==========================================================
cd backend
python -m pytest tests/ -v
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Backend test suite failed.
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================================
echo  2. Compiling Frontend Production Bundle (TypeScript + Vite)
echo ==========================================================
cd ..\frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Frontend build failed.
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================================
echo  3. Executing Live Full-Stack E2E Test Suite (PostgreSQL + Docker)
echo ==========================================================
cd ..
python scripts/verify_live_api.py
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Live API verification failed.
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================================
echo  [SUCCESS] All Unit Tests, Builds, and Live APIs PASSED! 🏆
echo ==========================================================
