@echo off
REM ===================================
REM ITSM 全サービス起動スクリプト (Windows)
REM ===================================

echo ==========================================
echo IT Management System - Full Startup
echo ==========================================

REM .envファイルの確認
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo Please edit .env file if needed
)

REM バックエンドを新しいコマンドプロンプトで起動
echo Starting backend server...
start "ITSM Backend" cmd /k start-backend.bat

REM 少し待つ
timeout /t 3 /nobreak > nul

REM フロントエンドを起動
echo Starting frontend server...
echo.
call npm install
call npm run dev

echo.
echo ==========================================
echo All services started
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
echo ==========================================