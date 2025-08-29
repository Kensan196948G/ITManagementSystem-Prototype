#!/bin/bash
# IT Management System - Migration Verification Script
# 移行作業の検証用スクリプト

set -e

echo "=== IT Management System - Migration Verification ==="
echo "検証開始時刻: $(date)"

# 色付きログ関数
log_info() { echo -e "\033[32m[INFO]\033[0m $1"; }
log_warn() { echo -e "\033[33m[WARN]\033[0m $1"; }
log_error() { echo -e "\033[31m[ERROR]\033[0m $1"; }
log_success() { echo -e "\033[32m[SUCCESS]\033[0m $1"; }

# 検証結果カウンター
PASSED=0
FAILED=0

# テスト関数
test_check() {
    if [ $? -eq 0 ]; then
        log_success "$1: PASSED"
        ((PASSED++))
    else
        log_error "$1: FAILED"
        ((FAILED++))
    fi
}

# 1. 必須ファイルの存在確認
log_info "=== 1. 必須ファイル存在確認 ==="

# requirements.txt確認
if [ -f "requirements.txt" ]; then
    log_success "requirements.txt: 存在"
    ((PASSED++))
else
    log_error "requirements.txt: 存在しません"
    ((FAILED++))
fi

# .env確認
if [ -f ".env" ]; then
    log_success ".env: 存在"
    ((PASSED++))
else
    log_error ".env: 存在しません"
    ((FAILED++))
fi

# package.json確認（フロントエンド）
if [ -f "package.json" ]; then
    log_success "package.json: 存在"
    ((PASSED++))
else
    log_warn "package.json: 存在しません（フロントエンドなしの可能性）"
fi

# 2. Python仮想環境の確認
log_info "=== 2. Python仮想環境確認 ==="

# メイン仮想環境
if [ -d "venv" ] && [ -f "venv/bin/activate" ]; then
    log_success "メイン仮想環境: 存在"
    
    # 仮想環境内のPythonバージョン確認
    source venv/bin/activate
    PYTHON_VERSION=$(python --version 2>&1)
    log_info "Python バージョン: $PYTHON_VERSION"
    
    # pip確認
    if command -v pip >/dev/null 2>&1; then
        PIP_VERSION=$(pip --version)
        log_info "pip バージョン: $PIP_VERSION"
        log_success "pip: 利用可能"
        ((PASSED++))
    else
        log_error "pip: 利用できません"
        ((FAILED++))
    fi
    
    # requirements.txtの依存関係確認
    if [ -f "requirements.txt" ]; then
        log_info "依存関係の確認中..."
        if pip check >/dev/null 2>&1; then
            log_success "依存関係: 整合性OK"
            ((PASSED++))
        else
            log_warn "依存関係: 競合またはエラーあり"
            pip check
        fi
    fi
    
    deactivate
    ((PASSED++))
else
    log_error "メイン仮想環境: 存在しません"
    ((FAILED++))
fi

# Backend仮想環境
if [ -d "packages/backend/venv" ] && [ -f "packages/backend/venv/bin/activate" ]; then
    log_success "Backend仮想環境: 存在"
    ((PASSED++))
else
    log_warn "Backend仮想環境: 存在しません（必要に応じて作成）"
fi

# 3. 絶対パス依存の確認
log_info "=== 3. 絶対パス依存確認 ==="

# pyvenv.cfg確認
if [ -f "venv/pyvenv.cfg" ]; then
    if grep -q "$(pwd)" venv/pyvenv.cfg; then
        log_warn "venv/pyvenv.cfg: 現在のパスが含まれています（移行後に自動修正されます）"
    else
        log_success "venv/pyvenv.cfg: 絶対パス依存なし"
        ((PASSED++))
    fi
else
    log_warn "venv/pyvenv.cfg: 存在しません"
fi

# 設定ファイル内の絶対パス確認
log_info "設定ファイル内の絶対パス確認中..."
ABS_PATH_FILES=$(find . -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.env*" | xargs grep -l "$(pwd)" 2>/dev/null || true)
if [ -z "$ABS_PATH_FILES" ]; then
    log_success "設定ファイル: 絶対パス依存なし"
    ((PASSED++))
else
    log_warn "以下のファイルに絶対パスが含まれています:"
    echo "$ABS_PATH_FILES"
fi

# 4. Node.js環境確認（該当する場合）
if [ -f "package.json" ]; then
    log_info "=== 4. Node.js環境確認 ==="
    
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        log_info "Node.js バージョン: $NODE_VERSION"
        log_success "Node.js: 利用可能"
        ((PASSED++))
    else
        log_error "Node.js: インストールされていません"
        ((FAILED++))
    fi
    
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        log_info "npm バージョン: $NPM_VERSION"
        log_success "npm: 利用可能"
        ((PASSED++))
    else
        log_error "npm: インストールされていません"
        ((FAILED++))
    fi
    
    # node_modulesの確認
    if [ -d "node_modules" ]; then
        log_success "node_modules: 存在"
        ((PASSED++))
    else
        log_warn "node_modules: 存在しません（npm install を実行してください）"
    fi
fi

# 5. ポート使用状況確認
log_info "=== 5. ポート使用状況確認 ==="
DEFAULT_PORTS=(3000 8000 5432 6379)
for port in "${DEFAULT_PORTS[@]}"; do
    if lsof -i :$port >/dev/null 2>&1; then
        log_warn "ポート $port: 使用中"
    else
        log_info "ポート $port: 利用可能"
    fi
done

# 6. 環境変数の確認
log_info "=== 6. 環境変数確認 ==="
if [ -f ".env" ]; then
    # 重要な環境変数の存在確認
    REQUIRED_VARS=("SECRET_KEY" "DATABASE_URL" "REDIS_URL")
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env; then
            VALUE=$(grep "^$var=" .env | cut -d'=' -f2-)
            if [ -n "$VALUE" ] && [ "$VALUE" != "change-this-secret-key-in-production" ]; then
                log_success "$var: 設定済み"
                ((PASSED++))
            else
                log_warn "$var: デフォルト値または空です"
            fi
        else
            log_error "$var: 設定されていません"
            ((FAILED++))
        fi
    done
fi

# 結果サマリー
echo ""
log_info "=== 検証結果サマリー ==="
echo "通過: $PASSED"
echo "失敗: $FAILED"

if [ $FAILED -eq 0 ]; then
    log_success "全ての基本チェックが通過しました！"
    echo ""
    echo "次のステップ:"
    echo "1. 'source venv/bin/activate' で仮想環境を有効化"
    echo "2. 'python -m pip install --upgrade pip' でpipを最新化"
    echo "3. アプリケーションを起動してテスト"
    echo "4. 必要に応じて.envファイルの値を調整"
else
    log_warn "一部のチェックで問題が検出されました。上記の警告・エラーを確認してください。"
fi

echo ""
echo "検証完了時刻: $(date)"