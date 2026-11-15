@echo off
REM ==============================================================================
REM CareHealth Point – Quickstart Local Development Server
REM Course: DevOps & Automation Lab (ENSP461)
REM ==============================================================================

echo ==========================================================
echo  Starting CareHealth Point (Backend + Frontend)
echo ==========================================================

start "CareHealth Backend API" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "CareHealth React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo [INFO] CareHealth Point services launching:
echo   - Backend REST API: http://127.0.0.1:8000
echo   - Interactive API Docs: http://127.0.0.1:8000/docs
echo   - Prometheus Metrics: http://127.0.0.1:8000/metrics
echo   - Frontend Portal: http://localhost:3000
echo.
pause
