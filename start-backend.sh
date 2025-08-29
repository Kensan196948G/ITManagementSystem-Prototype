#!/bin/bash
# ===================================
# ITSMバックエンドサーバー起動スクリプト
# ===================================

echo "=========================================="
echo "IT Management System - Backend Startup"
echo "=========================================="

# スクリプトのディレクトリに移動
cd "$(dirname "$0")"

# 仮想環境の確認と作成
if [ ! -d "venv" ]; then
    echo "📦 仮想環境を作成しています..."
    python3 -m venv venv
fi

# 仮想環境を有効化
echo "🔧 仮想環境を有効化しています..."
source venv/bin/activate

# 必要なパッケージをインストール
echo "📚 必要なパッケージをインストールしています..."
pip install -q flask flask-cors flask-sqlalchemy werkzeug

# バックエンドディレクトリに移動
cd packages/backend

# バックエンドサーバーを起動
echo "🚀 バックエンドサーバーを起動しています..."
echo "URL: http://localhost:8000"
echo ""
echo "利用可能なユーザー:"
echo "  admin / admin123"
echo "  user / user123"
echo ""
echo "Ctrl+C で終了"
echo "=========================================="

# app_simple.pyを起動
python app_simple.py