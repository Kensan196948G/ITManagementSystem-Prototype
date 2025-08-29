#!/bin/bash
# =============================================================================
# Cross-Platform Migration Script
# =============================================================================
# このスクリプトは ITManagementSystem-Prototype を別のPC/環境に移行します
#
# 使用方法:
#   ./migrate-to-new-environment.sh [target_directory]
#
# 機能:
# - 完全ポータビリティ対応
# - 絶対パス依存の自動解消
# - 環境設定の自動生成
# - 依存関係のインストール
# - 権限設定の適用
# =============================================================================

set -e  # エラー時に終了
set -o pipefail  # パイプラインでエラーが発生した場合も終了

# カラー出力設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# プラットフォーム検出
detect_platform() {
    case "$(uname -s)" in
        Linux*)   PLATFORM='Linux';;
        Darwin*)  PLATFORM='macOS';;
        MINGW*)   PLATFORM='Windows';;
        MSYS*)    PLATFORM='Windows';;
        CYGWIN*)  PLATFORM='Windows';;
        *)        PLATFORM='Unknown';;
    esac
    echo $PLATFORM
}

# 必須ツールの確認
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing_tools=()
    
    # Node.js
    if ! command -v node &> /dev/null; then
        missing_tools+=("Node.js")
    fi
    
    # npm
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    # Python
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        missing_tools+=("Python 3")
    fi
    
    # pip
    if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
        missing_tools+=("pip")
    fi
    
    # Git (オプション)
    if ! command -v git &> /dev/null; then
        log_warning "Git is not installed - version control features will be limited"
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Please install the missing tools and run this script again"
        exit 1
    fi
    
    log_success "All prerequisites found"
}

# ディレクトリ構造の作成
create_directory_structure() {
    log_info "Creating directory structure..."
    
    local dirs=(
        "logs"
        "uploads"
        "temp"
        "backups"
        "cache"
        "test-results"
        "screenshots"
        "certs"
        "config"
    )
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_success "Created directory: $dir"
        fi
    done
}

# 環境設定ファイルの初期化
initialize_env_files() {
    log_info "Initializing environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp ".env.example" ".env"
            log_success "Created .env from .env.example"
        else
            log_warning ".env.example not found - creating basic .env"
            cat > ".env" << 'EOF'
# Basic ITManagement System Configuration
NODE_ENV=development
SERVER_HOST=localhost
SERVER_PORT=3000
DB_TYPE=sqlite
DB_NAME=./itsm.db
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# MCP Configuration
CLAUDE_FLOW_ENABLED=true
CONTEXT7_ENABLED=true
PLAYWRIGHT_MCP_ENABLED=true
SERENA_MCP_ENABLED=true
GITHUB_ACTION_MCP_ENABLED=true

# Security (CHANGE THESE VALUES)
JWT_SECRET=CHANGE_ME_TO_SECURE_VALUE
SESSION_SECRET=CHANGE_ME_TO_SECURE_VALUE
CSRF_SECRET=CHANGE_ME_TO_SECURE_VALUE
EOF
            log_warning "⚠️  Please edit .env and update the security values"
        fi
    else
        log_info ".env already exists - skipping"
    fi
}

# Node.js依存関係のインストール
install_node_dependencies() {
    log_info "Installing Node.js dependencies..."
    
    if [ -f "package.json" ]; then
        # npm ci を推奨、ただし package-lock.json がない場合は npm install
        if [ -f "package-lock.json" ]; then
            npm ci
        else
            npm install
        fi
        log_success "Node.js dependencies installed"
    else
        log_warning "package.json not found - skipping Node.js dependencies"
    fi
    
    # Frontend dependencies
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        log_info "Installing frontend dependencies..."
        cd frontend
        if [ -f "package-lock.json" ]; then
            npm ci
        else
            npm install
        fi
        cd ..
        log_success "Frontend dependencies installed"
    fi
}

# Python依存関係のインストール
install_python_dependencies() {
    log_info "Setting up Python environment..."
    
    # Python コマンドの決定
    PYTHON_CMD="python3"
    if ! command -v python3 &> /dev/null; then
        if command -v python &> /dev/null; then
            PYTHON_CMD="python"
        else
            log_error "Python not found"
            return 1
        fi
    fi
    
    # pip コマンドの決定
    PIP_CMD="pip3"
    if ! command -v pip3 &> /dev/null; then
        if command -v pip &> /dev/null; then
            PIP_CMD="pip"
        else
            log_error "pip not found"
            return 1
        fi
    fi
    
    # Virtual environment の作成
    if [ ! -d "venv" ]; then
        log_info "Creating Python virtual environment..."
        $PYTHON_CMD -m venv venv
        log_success "Virtual environment created"
    fi
    
    # Virtual environment の有効化
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
        log_info "Activated virtual environment"
    elif [ -f "venv/Scripts/activate" ]; then
        source venv/Scripts/activate
        log_info "Activated virtual environment (Windows)"
    else
        log_warning "Could not activate virtual environment"
    fi
    
    # Python dependencies のインストール
    if [ -f "requirements.txt" ]; then
        $PIP_CMD install -r requirements.txt
        log_success "Python dependencies installed"
    else
        log_warning "requirements.txt not found"
    fi
    
    # Backend specific requirements
    if [ -f "apps/backend/requirements.txt" ]; then
        log_info "Installing backend Python dependencies..."
        $PIP_CMD install -r apps/backend/requirements.txt
        log_success "Backend dependencies installed"
    fi
}

# データベースの初期化
initialize_database() {
    log_info "Initializing database..."
    
    # SQLite database creation (if not exists)
    if [ ! -f "itsm.db" ]; then
        # Django/Flask style migrations
        if [ -f "manage.py" ]; then
            python manage.py migrate
        elif [ -f "alembic.ini" ]; then
            alembic upgrade head
        else
            log_info "Creating empty SQLite database..."
            touch itsm.db
        fi
        log_success "Database initialized"
    else
        log_info "Database already exists - skipping initialization"
    fi
}

# SSL証明書の生成
generate_ssl_certificates() {
    if [ ! -f "certs/server.crt" ] || [ ! -f "certs/server.key" ]; then
        log_info "Generating self-signed SSL certificates for development..."
        
        mkdir -p certs
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout certs/server.key \
            -out certs/server.crt \
            -subj "/C=US/ST=Development/L=Local/O=ITManagement/OU=Dev/CN=localhost" 2>/dev/null || {
            log_warning "Could not generate SSL certificates - OpenSSL may not be installed"
            log_info "SSL certificates are optional for development"
        }
        
        if [ -f "certs/server.crt" ]; then
            log_success "SSL certificates generated"
        fi
    else
        log_info "SSL certificates already exist"
    fi
}

# 権限設定
set_permissions() {
    log_info "Setting appropriate permissions..."
    
    # スクリプトファイルを実行可能にする
    local script_files=(
        "start-all.sh"
        "start-backend.sh" 
        "migrate-to-new-environment.sh"
        "verify-migration.sh"
        "system-status.sh"
    )
    
    for script in "${script_files[@]}"; do
        if [ -f "$script" ]; then
            chmod +x "$script"
            log_success "Made $script executable"
        fi
    done
    
    # Scripts directory
    if [ -d "scripts" ]; then
        find scripts -name "*.sh" -type f -exec chmod +x {} \;
        log_success "Made scripts executable"
    fi
    
    # Log directory permissions
    if [ -d "logs" ]; then
        chmod 755 logs
    fi
    
    # Uploads directory permissions
    if [ -d "uploads" ]; then
        chmod 755 uploads
    fi
}

# Cross-platform configuration の生成
generate_cross_platform_config() {
    log_info "Generating cross-platform configuration..."
    
    if [ -f "config/cross-platform-config.js" ]; then
        cd config
        node cross-platform-config.js
        cd ..
        log_success "Cross-platform configuration generated"
    else
        log_warning "Cross-platform configuration script not found"
    fi
}

# 移行検証
verify_migration() {
    log_info "Verifying migration..."
    
    local verification_failed=0
    
    # Check essential files
    local essential_files=(
        "package.json"
        ".env"
        "config/cross-platform-config.js"
    )
    
    for file in "${essential_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Essential file missing: $file"
            verification_failed=1
        fi
    done
    
    # Check essential directories
    local essential_dirs=(
        "logs"
        "uploads"
        "config"
    )
    
    for dir in "${essential_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            log_error "Essential directory missing: $dir"
            verification_failed=1
        fi
    done
    
    # Check Node.js installation
    if ! npm list --depth=0 &> /dev/null; then
        log_warning "Node.js dependencies verification failed"
    fi
    
    # Check if services can start
    if [ -f "system-status.sh" ]; then
        if ! ./system-status.sh --check-only; then
            log_warning "System status check failed - some services may not be ready"
        fi
    fi
    
    if [ $verification_failed -eq 0 ]; then
        log_success "Migration verification completed successfully"
        return 0
    else
        log_error "Migration verification failed"
        return 1
    fi
}

# メイン処理
main() {
    local target_dir="${1:-$(pwd)}"
    local platform=$(detect_platform)
    
    echo "================================================================="
    echo "ITManagement System - Cross-Platform Migration"
    echo "================================================================="
    echo "Platform: $platform"
    echo "Target Directory: $target_dir"
    echo "Timestamp: $(date)"
    echo "================================================================="
    
    # ターゲットディレクトリに移動
    if [ "$target_dir" != "$(pwd)" ]; then
        if [ ! -d "$target_dir" ]; then
            log_error "Target directory does not exist: $target_dir"
            exit 1
        fi
        cd "$target_dir"
        log_info "Changed to directory: $target_dir"
    fi
    
    # Migration steps
    check_prerequisites
    create_directory_structure
    initialize_env_files
    install_node_dependencies
    install_python_dependencies
    initialize_database
    generate_ssl_certificates
    set_permissions
    generate_cross_platform_config
    
    echo ""
    echo "================================================================="
    echo "Migration Summary"
    echo "================================================================="
    
    if verify_migration; then
        log_success "🎉 Migration completed successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Edit .env file and update configuration values"
        echo "2. Run './start-all.sh' to start the system"
        echo "3. Access the application at http://localhost:3000"
        echo ""
        echo "For troubleshooting: ./system-status.sh"
    else
        log_error "❌ Migration completed with errors"
        echo ""
        echo "Please review the errors above and:"
        echo "1. Fix any missing dependencies"
        echo "2. Check file permissions"
        echo "3. Run this script again"
        exit 1
    fi
}

# スクリプトが直接実行された場合
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi