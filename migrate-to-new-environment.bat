@echo off
REM =============================================================================
REM Cross-Platform Migration Script - Windows Version
REM =============================================================================
REM このスクリプトは ITManagementSystem-Prototype を別のWindows PCに移行します
REM
REM 使用方法:
REM   migrate-to-new-environment.bat [target_directory]
REM
REM 機能:
REM - Windows環境での完全ポータビリティ対応
REM - 絶対パス依存の自動解消
REM - 環境設定の自動生成
REM - 依存関係のインストール
REM =============================================================================

setlocal enabledelayedexpansion

REM カラー設定 (Windows 10以降)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM ログ関数の代わりに
set "LOG_INFO=echo %BLUE%[INFO]%NC%"
set "LOG_SUCCESS=echo %GREEN%[SUCCESS]%NC%"
set "LOG_WARNING=echo %YELLOW%[WARNING]%NC%"
set "LOG_ERROR=echo %RED%[ERROR]%NC%"

REM メイン処理開始
echo =================================================================
echo ITManagement System - Cross-Platform Migration (Windows)
echo =================================================================
echo Platform: Windows
echo Current Directory: %CD%
echo Timestamp: %DATE% %TIME%
echo =================================================================

REM 必須ツールの確認
%LOG_INFO% Checking prerequisites...

where node >nul 2>&1
if %errorlevel% neq 0 (
    %LOG_ERROR% Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>&1  
if %errorlevel% neq 0 (
    %LOG_ERROR% npm is not available
    echo Please ensure npm is installed with Node.js
    pause
    exit /b 1
)

where python >nul 2>&1
if %errorlevel% neq 0 (
    where py >nul 2>&1
    if %errorlevel% neq 0 (
        %LOG_ERROR% Python is not installed or not in PATH
        echo Please install Python from https://www.python.org/
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=py
    )
) else (
    set PYTHON_CMD=python
)

where pip >nul 2>&1
if %errorlevel% neq 0 (
    %LOG_ERROR% pip is not available
    echo Please ensure pip is installed with Python
    pause
    exit /b 1
)

%LOG_SUCCESS% All prerequisites found

REM ディレクトリ構造の作成
%LOG_INFO% Creating directory structure...

set DIRS=logs uploads temp backups cache test-results screenshots certs config

for %%d in (%DIRS%) do (
    if not exist "%%d" (
        mkdir "%%d" 2>nul
        if exist "%%d" (
            %LOG_SUCCESS% Created directory: %%d
        ) else (
            %LOG_ERROR% Failed to create directory: %%d
        )
    )
)

REM 環境設定ファイルの初期化
%LOG_INFO% Initializing environment configuration...

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        %LOG_SUCCESS% Created .env from .env.example
    ) else (
        %LOG_WARNING% .env.example not found - creating basic .env
        (
            echo # Basic ITManagement System Configuration
            echo NODE_ENV=development
            echo SERVER_HOST=localhost
            echo SERVER_PORT=3000
            echo DB_TYPE=sqlite
            echo DB_NAME=./itsm.db
            echo LOG_LEVEL=info
            echo LOG_FILE_PATH=./logs/app.log
            echo.
            echo # MCP Configuration
            echo CLAUDE_FLOW_ENABLED=true
            echo CONTEXT7_ENABLED=true
            echo PLAYWRIGHT_MCP_ENABLED=true
            echo SERENA_MCP_ENABLED=true
            echo GITHUB_ACTION_MCP_ENABLED=true
            echo.
            echo # Security (CHANGE THESE VALUES)
            echo JWT_SECRET=CHANGE_ME_TO_SECURE_VALUE
            echo SESSION_SECRET=CHANGE_ME_TO_SECURE_VALUE
            echo CSRF_SECRET=CHANGE_ME_TO_SECURE_VALUE
        ) > ".env"
        %LOG_WARNING% Please edit .env and update the security values
    )
) else (
    %LOG_INFO% .env already exists - skipping
)

REM Node.js依存関係のインストール
%LOG_INFO% Installing Node.js dependencies...

if exist "package.json" (
    if exist "package-lock.json" (
        npm ci
    ) else (
        npm install
    )
    if %errorlevel% equ 0 (
        %LOG_SUCCESS% Node.js dependencies installed
    ) else (
        %LOG_ERROR% Failed to install Node.js dependencies
    )
) else (
    %LOG_WARNING% package.json not found - skipping Node.js dependencies
)

REM Frontend dependencies
if exist "frontend\package.json" (
    %LOG_INFO% Installing frontend dependencies...
    cd frontend
    if exist "package-lock.json" (
        npm ci
    ) else (
        npm install
    )
    if %errorlevel% equ 0 (
        %LOG_SUCCESS% Frontend dependencies installed
    ) else (
        %LOG_ERROR% Failed to install frontend dependencies
    )
    cd ..
)

REM Python環境の設定
%LOG_INFO% Setting up Python environment...

REM Virtual environment の作成
if not exist "venv" (
    %LOG_INFO% Creating Python virtual environment...
    %PYTHON_CMD% -m venv venv
    if %errorlevel% equ 0 (
        %LOG_SUCCESS% Virtual environment created
    ) else (
        %LOG_ERROR% Failed to create virtual environment
    )
)

REM Virtual environment の有効化
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    %LOG_INFO% Activated virtual environment
) else (
    %LOG_WARNING% Could not activate virtual environment
)

REM Python dependencies のインストール
if exist "requirements.txt" (
    pip install -r requirements.txt
    if %errorlevel% equ 0 (
        %LOG_SUCCESS% Python dependencies installed
    ) else (
        %LOG_ERROR% Failed to install Python dependencies
    )
) else (
    %LOG_WARNING% requirements.txt not found
)

REM Backend specific requirements
if exist "apps\backend\requirements.txt" (
    %LOG_INFO% Installing backend Python dependencies...
    pip install -r apps\backend\requirements.txt
    if %errorlevel% equ 0 (
        %LOG_SUCCESS% Backend dependencies installed
    ) else (
        %LOG_ERROR% Failed to install backend dependencies
    )
)

REM データベースの初期化
%LOG_INFO% Initializing database...

if not exist "itsm.db" (
    %LOG_INFO% Creating empty SQLite database...
    type nul > itsm.db
    %LOG_SUCCESS% Database initialized
) else (
    %LOG_INFO% Database already exists - skipping initialization
)

REM Cross-platform configuration の生成
%LOG_INFO% Generating cross-platform configuration...

if exist "config\cross-platform-config.js" (
    cd config
    node cross-platform-config.js
    if %errorlevel% equ 0 (
        %LOG_SUCCESS% Cross-platform configuration generated
    ) else (
        %LOG_ERROR% Failed to generate cross-platform configuration
    )
    cd ..
) else (
    %LOG_WARNING% Cross-platform configuration script not found
)

REM 移行検証
%LOG_INFO% Verifying migration...

set VERIFICATION_FAILED=0

REM Check essential files
set ESSENTIAL_FILES=package.json .env config\cross-platform-config.js

for %%f in (%ESSENTIAL_FILES%) do (
    if not exist "%%f" (
        %LOG_ERROR% Essential file missing: %%f
        set VERIFICATION_FAILED=1
    )
)

REM Check essential directories  
set ESSENTIAL_DIRS=logs uploads config

for %%d in (%ESSENTIAL_DIRS%) do (
    if not exist "%%d" (
        %LOG_ERROR% Essential directory missing: %%d
        set VERIFICATION_FAILED=1
    )
)

echo.
echo =================================================================
echo Migration Summary
echo =================================================================

if %VERIFICATION_FAILED% equ 0 (
    %LOG_SUCCESS% Migration completed successfully!
    echo.
    echo Next steps:
    echo 1. Edit .env file and update configuration values
    echo 2. Run 'start-all.bat' to start the system
    echo 3. Access the application at http://localhost:3000
    echo.
    echo For troubleshooting, check the logs directory
) else (
    %LOG_ERROR% Migration completed with errors
    echo.
    echo Please review the errors above and:
    echo 1. Fix any missing dependencies
    echo 2. Check file permissions
    echo 3. Run this script again
    pause
    exit /b 1
)

pause
endlocal