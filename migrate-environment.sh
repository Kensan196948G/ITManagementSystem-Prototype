#!/bin/bash
# IT Management System - Environment Migration Script
# 緊急移行作業用安全実行スクリプト

set -e  # エラー時に停止

echo "=== IT Management System - Environment Migration ==="
echo "開始時刻: $(date)"

# 色付きログ関数
log_info() { echo -e "\033[32m[INFO]\033[0m $1"; }
log_warn() { echo -e "\033[33m[WARN]\033[0m $1"; }
log_error() { echo -e "\033[31m[ERROR]\033[0m $1"; }

# バックアップディレクトリ作成
BACKUP_DIR="./backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
log_info "バックアップディレクトリ作成: $BACKUP_DIR"

# 1. 現在の仮想環境から依存関係を抽出
log_info "=== Step 1: 依存関係抽出 ==="
if [ -f "venv/bin/activate" ]; then
    log_info "現在の仮想環境から依存関係を抽出中..."
    
    # 既存のrequirements.txtをバックアップ
    if [ -f "requirements.txt" ]; then
        cp requirements.txt "$BACKUP_DIR/requirements.txt.backup"
        log_info "既存のrequirements.txtをバックアップしました"
    fi
    
    # 仮想環境をアクティベートして依存関係抽出
    source venv/bin/activate
    pip freeze > requirements_current.txt
    log_info "現在の依存関係をrequirements_current.txtに保存しました"
    deactivate
else
    log_warn "venv/bin/activate が見つかりません。requirements.txtを使用します"
fi

# 2. 古い仮想環境のバックアップ
log_info "=== Step 2: 仮想環境バックアップ ==="
if [ -d "venv" ]; then
    log_info "既存仮想環境をバックアップ中..."
    cp -r venv "$BACKUP_DIR/venv_backup"
    log_info "仮想環境のバックアップ完了"
fi

# 3. packages/backend/venv のバックアップ
if [ -d "packages/backend/venv" ]; then
    log_info "Backend仮想環境をバックアップ中..."
    cp -r packages/backend/venv "$BACKUP_DIR/backend_venv_backup"
    log_info "Backend仮想環境のバックアップ完了"
fi

# 4. 新しいポータブル仮想環境の作成
log_info "=== Step 3: 新しい仮想環境作成 ==="
read -p "既存の仮想環境を削除して再作成しますか? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "既存仮想環境を削除中..."
    rm -rf venv
    
    log_info "新しい仮想環境を作成中..."
    python -m venv venv
    
    log_info "仮想環境をアクティベートして依存関係をインストール..."
    source venv/bin/activate
    pip install --upgrade pip
    
    if [ -f "requirements_current.txt" ]; then
        log_info "現在の依存関係からインストール..."
        pip install -r requirements_current.txt
    elif [ -f "requirements.txt" ]; then
        log_info "requirements.txtからインストール..."
        pip install -r requirements.txt
    else
        log_error "依存関係ファイルが見つかりません"
        exit 1
    fi
    
    deactivate
    log_info "メイン仮想環境の再作成完了"
else
    log_info "仮想環境の再作成をスキップしました"
fi

# 5. Backend仮想環境の処理
if [ -d "packages/backend" ]; then
    log_info "=== Step 4: Backend仮想環境処理 ==="
    cd packages/backend
    
    read -p "Backend仮想環境も再作成しますか? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -d "venv" ]; then
            rm -rf venv
        fi
        
        python -m venv venv
        source venv/bin/activate
        pip install --upgrade pip
        
        if [ -f "requirements.txt" ]; then
            pip install -r requirements.txt
        elif [ -f "../../requirements.txt" ]; then
            pip install -r ../../requirements.txt
        fi
        
        deactivate
        log_info "Backend仮想環境の再作成完了"
    fi
    
    cd ../..
fi

# 6. 環境設定ファイルの確認
log_info "=== Step 5: 環境設定確認 ==="
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        log_info ".env.exampleから.envを作成..."
        cp .env.example .env
        log_warn ".envファイルの設定値を確認・更新してください"
    else
        log_warn ".envファイルが存在しません。手動で作成してください"
    fi
else
    log_info ".envファイルは既に存在します"
fi

# 7. 移行検証の実行
log_info "=== Step 6: 移行検証 ==="
bash ./verify-migration.sh

log_info "=== 移行作業完了 ==="
echo "完了時刻: $(date)"
echo "バックアップ場所: $BACKUP_DIR"
echo ""
echo "次のステップ:"
echo "1. .envファイルの設定値を確認・更新"
echo "2. 'npm install' でフロントエンド依存関係をインストール"
echo "3. 'npm run dev' で開発サーバーを起動"
echo "4. アプリケーションの動作確認"