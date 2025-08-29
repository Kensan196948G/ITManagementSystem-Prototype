#!/bin/bash
# ===================================
# ITSM 全サービス起動スクリプト
# ===================================

echo "=========================================="
echo "IT Management System - Full Startup"
echo "=========================================="

# スクリプトのディレクトリに移動
cd "$(dirname "$0")"

# .envファイルの確認
if [ ! -f ".env" ]; then
    echo "📝 .envファイルを作成しています..."
    cp .env.example .env
    echo "⚠️  .envファイルを必要に応じて編集してください"
fi

# バックエンドを別ターミナルで起動
echo "🔧 バックエンドサーバーを起動しています..."
gnome-terminal --tab --title="ITSM Backend" -- bash -c "./start-backend.sh; exec bash" 2>/dev/null || \
xterm -title "ITSM Backend" -e "./start-backend.sh" 2>/dev/null || \
(./start-backend.sh &)

# 少し待つ
sleep 3

# フロントエンドを起動
echo "🎨 フロントエンドサーバーを起動しています..."
echo ""
npm install
npm run dev

echo ""
echo "=========================================="
echo "✅ 全サービスが起動しました"
echo "フロントエンド: http://localhost:5173"
echo "バックエンド: http://localhost:8000"
echo "=========================================="