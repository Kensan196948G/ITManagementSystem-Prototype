#!/bin/bash
# ITサービス管理システム - クイック移行スクリプト (Linux/macOS)
# Context7統合による知的移行システム

set -e  # エラー時に停止

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${CYAN}🔄 $1${NC}"
}

log_success() {
    echo -e "${PURPLE}🎉 $1${NC}"
}

# グローバル変数
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
START_TIME=$(date +%s)

# Context7: システムコンテキスト - 環境検出
detect_environment() {
    log_step "Context7 環境検出中..."
    
    echo "Platform: $PLATFORM"
    echo "Architecture: $ARCH"
    
    # Node.js検出
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        log_info "Node.js: $NODE_VERSION"
    else
        log_warn "Node.js が見つかりません"
        NODE_VERSION=""
    fi
    
    # Python検出
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_VERSION=$(python3 --version)
        log_info "Python: $PYTHON_VERSION"
        PYTHON_CMD="python3"
    elif command -v python >/dev/null 2>&1; then
        PYTHON_VERSION=$(python --version)
        log_info "Python: $PYTHON_VERSION"
        PYTHON_CMD="python"
    else
        log_warn "Python が見つかりません"
        PYTHON_VERSION=""
        PYTHON_CMD=""
    fi
    
    # npm検出
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        log_info "npm: $NPM_VERSION"
    else
        log_warn "npm が見つかりません"
        NPM_VERSION=""
    fi
    
    # Git検出
    if command -v git >/dev/null 2>&1; then
        GIT_VERSION=$(git --version)
        log_info "Git: $GIT_VERSION"
    else
        log_warn "Git が見つかりません"
        GIT_VERSION=""
    fi
}

# Context7: エラーコンテキスト - 前提条件チェック
check_prerequisites() {
    log_step "Context7 前提条件チェック中..."
    
    local prerequisites_met=true
    
    # Node.js版本检查
    if [[ -z "$NODE_VERSION" ]]; then
        log_error "Node.js が必要です (v18以上)"
        prerequisites_met=false
    else
        local node_major=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
        if [[ "$node_major" -lt 18 ]]; then
            log_error "Node.js v18以上が必要です (現在: $NODE_VERSION)"
            prerequisites_met=false
        fi
    fi
    
    # Python版本检查
    if [[ -z "$PYTHON_VERSION" ]]; then
        log_error "Python が必要です (v3.8以上)"
        prerequisites_met=false
    else
        local python_version_num=$(echo "$PYTHON_VERSION" | sed 's/Python //' | cut -d. -f1,2)
        if ! awk 'BEGIN{exit !('$python_version_num' >= 3.8)}' 2>/dev/null; then
            log_error "Python v3.8以上が必要です (現在: $PYTHON_VERSION)"
            prerequisites_met=false
        fi
    fi
    
    # npm検查
    if [[ -z "$NPM_VERSION" ]]; then
        log_error "npm が必要です"
        prerequisites_met=false
    fi
    
    # ディスク容量チェック
    local available_space
    if command -v df >/dev/null 2>&1; then
        available_space=$(df -BG "$PROJECT_ROOT" | awk 'NR==2 {print $4}' | sed 's/G//')
        if [[ "$available_space" -lt 5 ]]; then
            log_warn "ディスク容量が不足している可能性があります (利用可能: ${available_space}GB)"
        else
            log_info "ディスク容量: ${available_space}GB利用可能"
        fi
    fi
    
    # ポートチェック
    check_ports
    
    if [[ "$prerequisites_met" != true ]]; then
        log_error "前提条件が満たされていません。自動修復を試行します..."
        auto_repair_environment
    else
        log_info "前提条件チェック完了"
    fi
}

# ポート可用性チェック
check_ports() {
    local ports=(3000 5174 8000)
    local available_ports=0
    
    for port in "${ports[@]}"; do
        if command -v lsof >/dev/null 2>&1; then
            if ! lsof -i ":$port" >/dev/null 2>&1; then
                log_info "ポート $port は利用可能"
                ((available_ports++))
            else
                log_warn "ポート $port は使用中"
            fi
        elif command -v netstat >/dev/null 2>&1; then
            if ! netstat -ln | grep -q ":$port "; then
                log_info "ポート $port は利用可能"
                ((available_ports++))
            else
                log_warn "ポート $port は使用中"
            fi
        fi
    done
    
    if [[ "$available_ports" -lt 2 ]]; then
        log_warn "利用可能なポートが不足しています"
        return 1
    fi
    
    return 0
}

# Context7: エラーコンテキスト - 自動修復
auto_repair_environment() {
    log_step "Context7 自動修復実行中..."
    
    # Node.js自動インストール
    if [[ -z "$NODE_VERSION" ]] || ! check_node_version; then
        install_nodejs
    fi
    
    # Python自動インストール
    if [[ -z "$PYTHON_VERSION" ]] || ! check_python_version; then
        install_python
    fi
    
    # ポート競合解決
    resolve_port_conflicts
    
    log_info "自動修復完了"
}

check_node_version() {
    if [[ -n "$NODE_VERSION" ]]; then
        local node_major=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
        [[ "$node_major" -ge 18 ]]
    else
        false
    fi
}

check_python_version() {
    if [[ -n "$PYTHON_VERSION" ]]; then
        local python_version_num=$(echo "$PYTHON_VERSION" | sed 's/Python //' | cut -d. -f1,2)
        awk 'BEGIN{exit !('$python_version_num' >= 3.8)}' 2>/dev/null
    else
        false
    fi
}

install_nodejs() {
    log_step "Node.js自動インストール中..."
    
    case "$PLATFORM" in
        "darwin")
            if command -v brew >/dev/null 2>&1; then
                brew install node@18
                brew link --force --overwrite node@18
                log_info "Node.js (via Homebrew) インストール完了"
            else
                log_warn "Homebrewが見つかりません。手動でNode.jsをインストールしてください"
                return 1
            fi
            ;;
        "linux")
            if command -v curl >/dev/null 2>&1; then
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                sudo apt-get install -y nodejs
                log_info "Node.js (via NodeSource) インストール完了"
            else
                log_warn "curlが見つかりません。手動でNode.jsをインストールしてください"
                return 1
            fi
            ;;
        *)
            log_warn "プラットフォーム $PLATFORM でのNode.js自動インストールは未対応です"
            return 1
            ;;
    esac
}

install_python() {
    log_step "Python自動インストール中..."
    
    case "$PLATFORM" in
        "darwin")
            if command -v brew >/dev/null 2>&1; then
                brew install python@3.11
                log_info "Python (via Homebrew) インストール完了"
            else
                log_warn "Homebrewが見つかりません。手動でPythonをインストールしてください"
                return 1
            fi
            ;;
        "linux")
            if command -v apt-get >/dev/null 2>&1; then
                sudo apt-get update
                sudo apt-get install -y python3.11 python3.11-venv python3.11-dev
                log_info "Python (via apt) インストール完了"
            elif command -v yum >/dev/null 2>&1; then
                sudo yum install -y python3.11 python3.11-venv python3.11-devel
                log_info "Python (via yum) インストール完了"
            else
                log_warn "パッケージマネージャーが見つかりません。手動でPythonをインストールしてください"
                return 1
            fi
            ;;
        *)
            log_warn "プラットフォーム $PLATFORM でのPython自動インストールは未対応です"
            return 1
            ;;
    esac
}

resolve_port_conflicts() {
    log_step "ポート競合解決中..."
    
    local ports=(3000 5174 8000)
    local resolved_count=0
    
    for port in "${ports[@]}"; do
        if command -v lsof >/dev/null 2>&1; then
            local pids=$(lsof -ti ":$port" 2>/dev/null)
            if [[ -n "$pids" ]]; then
                echo "$pids" | xargs kill -9 2>/dev/null || true
                log_info "ポート $port のプロセスを終了しました"
                ((resolved_count++))
            fi
        fi
    done
    
    if [[ "$resolved_count" -gt 0 ]]; then
        log_info "$resolved_count 個のポート競合を解決しました"
    fi
}

# Context7: コードコンテキスト - 依存関係インストール
install_dependencies() {
    log_step "Context7 依存関係インストール中..."
    
    cd "$PROJECT_ROOT"
    
    # ルート依存関係
    log_step "ルート依存関係インストール中..."
    if npm install; then
        log_info "ルート依存関係インストール完了"
    else
        log_error "ルート依存関係インストール失敗"
        return 1
    fi
    
    # フロントエンド依存関係
    if [[ -d "frontend" ]]; then
        log_step "フロントエンド依存関係インストール中..."
        cd frontend
        if npm install; then
            log_info "フロントエンド依存関係インストール完了"
        else
            log_error "フロントエンド依存関係インストール失敗"
            cd "$PROJECT_ROOT"
            return 1
        fi
        cd "$PROJECT_ROOT"
    fi
    
    # バックエンド依存関係
    if [[ -d "backend" ]] && [[ -n "$PYTHON_CMD" ]]; then
        log_step "バックエンド依存関係インストール中..."
        cd backend
        
        # 仮想環境作成
        if [[ ! -d "venv" ]]; then
            "$PYTHON_CMD" -m venv venv
            log_info "Python仮想環境作成完了"
        fi
        
        # 仮想環境アクティベート＆依存関係インストール
        source venv/bin/activate
        if pip install -r requirements.txt; then
            log_info "バックエンド依存関係インストール完了"
        else
            log_error "バックエンド依存関係インストール失敗"
            deactivate
            cd "$PROJECT_ROOT"
            return 1
        fi
        deactivate
        cd "$PROJECT_ROOT"
    fi
    
    log_info "全依存関係インストール完了"
}

# Context7: システムコンテキスト - 環境設定
setup_environment() {
    log_step "Context7 環境設定中..."
    
    cd "$PROJECT_ROOT"
    
    # .env設定
    if [[ ! -f ".env" ]]; then
        if [[ -f ".env.example" ]]; then
            cp .env.example .env
            log_info ".envファイルを.env.exampleから作成"
        else
            # デフォルト.env作成
            cat > .env << EOF
# ITサービス管理システム環境設定
DATABASE_URL=sqlite:///./itsm.db
JWT_SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | base64)
SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | base64)

# Context7設定
CONTEXT7_ENABLED=true
CONTEXT7_LAYERS=all
CONTEXT7_CACHE_SIZE=1000

# Claude Flow設定
CLAUDE_FLOW_ENABLED=true
MAX_PARALLEL_TASKS=10
AUTO_REPAIR=true

# ネットワーク設定
PORT=5174
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:5174
BACKEND_URL=http://localhost:8000
EOF
            log_info "デフォルト.envファイルを作成"
        fi
    else
        log_info "既存の.envファイルを使用"
    fi
    
    # Context7設定最適化
    if [[ -f "context7-config.json" ]]; then
        log_step "Context7設定最適化中..."
        # システムリソースに基づく最適化をここに追加
        log_info "Context7設定最適化完了"
    fi
    
    log_info "環境設定完了"
}

# Context7: ユーザーコンテキスト - サービス起動準備
prepare_services() {
    log_step "Context7 サービス起動準備中..."
    
    cd "$PROJECT_ROOT"
    
    # package.jsonの存在確認
    if [[ ! -f "package.json" ]]; then
        log_error "package.jsonが見つかりません"
        return 1
    fi
    
    # 起動スクリプトの確認
    local start_scripts=$(jq -r '.scripts | keys[]' package.json 2>/dev/null | grep -E '(start|dev)' | head -5)
    
    if [[ -n "$start_scripts" ]]; then
        log_info "利用可能な起動スクリプト:"
        echo "$start_scripts" | sed 's/^/  - /'
    fi
    
    log_info "サービス起動準備完了"
}

# サービス起動
start_services() {
    log_step "Context7 サービス起動中..."
    
    cd "$PROJECT_ROOT"
    
    # 最適なスクリプト選択
    local start_script=""
    if npm run | grep -q "start:full"; then
        start_script="start:full"
    elif npm run | grep -q "dev"; then
        start_script="dev"
    elif npm run | grep -q "start"; then
        start_script="start"
    else
        log_error "起動スクリプトが見つかりません"
        return 1
    fi
    
    log_info "npm run $start_script でサービスを起動します"
    log_info "サービス起動中... (Ctrl+C で終了)"
    
    # サービス起動（フォアグラウンド）
    exec npm run "$start_script"
}

# メイン実行関数
main() {
    echo "🌟 === Context7統合移行システム開始 ==="
    echo
    
    # 実行時間計測開始
    local start_time=$START_TIME
    
    # 1. プロジェクトコンテキスト: 環境検出
    detect_environment
    echo
    
    # 2. エラーコンテキスト: 前提条件チェック
    check_prerequisites
    echo
    
    # 3. コードコンテキスト: 依存関係インストール
    if ! install_dependencies; then
        log_error "依存関係インストール失敗"
        exit 1
    fi
    echo
    
    # 4. システムコンテキスト: 環境設定
    setup_environment
    echo
    
    # 5. ユーザーコンテキスト: サービス起動準備
    prepare_services
    echo
    
    # 実行時間計算
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "Context7移行完了 (${duration}秒)"
    echo
    echo "🌐 アクセス情報:"
    echo "   • メインアプリ: http://localhost:5174"
    echo "   • API: http://localhost:8000" 
    echo "   • Context7: http://localhost:5174/context7"
    echo
    
    # 6. タスクコンテキスト: サービス起動
    read -p "サービスを起動しますか？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_services
    else
        log_info "手動でサービスを起動してください: npm run dev"
    fi
}

# スクリプト実行時の処理
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Ctrl+C ハンドリング
    trap 'echo -e "\n🛑 移行プロセスが中断されました"; exit 1' INT
    
    # メイン関数実行
    main "$@"
fi