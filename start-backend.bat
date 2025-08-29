@echo off
REM ===================================
REM ITSMバックエンドサーバー起動スクリプト (Windows)
REM ===================================

echo ==========================================
echo IT Management System - Backend Startup
echo ==========================================

REM 仮想環境の確認と作成
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM 仮想環境を有効化
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM 必要なパッケージをインストール
echo Installing required packages...
pip install -q flask flask-cors flask-sqlalchemy werkzeug

REM バックエンドディレクトリに移動
cd packages\backend

REM バックエンドサーバーを起動
echo Starting backend server...
echo URL: http://localhost:8000
echo.
echo Available users:
echo   admin / admin123
echo   user / user123
echo.
echo Press Ctrl+C to stop
echo ==========================================

REM app_simple.pyを起動
python app_simple.py