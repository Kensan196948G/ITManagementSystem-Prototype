#!/bin/bash
# IT Management System - Migration Execution Wrapper
# 緊急移行作業の実行用ワンライナー

echo "🚀 IT Management System - 緊急移行作業開始"
echo "=================================================="

# 権限設定
echo "📝 実行権限を設定中..."
chmod +x migrate-environment.sh
chmod +x verify-migration.sh

echo "✅ 実行権限設定完了"
echo ""

# 現在の状況確認
echo "📊 現在の状況確認:"
echo "- 作業ディレクトリ: $(pwd)"
echo "- Python バージョン: $(python --version 2>/dev/null || echo 'Python not found')"
echo "- 仮想環境: $([ -d 'venv' ] && echo '存在' || echo '存在しない')"
echo "- requirements.txt: $([ -f 'requirements.txt' ] && echo '存在' || echo '存在しない')"
echo "- .env: $([ -f '.env' ] && echo '存在' || echo '存在しない')"
echo ""

# 移行開始確認
read -p "🔄 移行作業を開始しますか？ (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🏃‍♂️ 移行スクリプト実行中..."
    ./migrate-environment.sh
    
    echo ""
    echo "🔍 移行検証実行中..."
    ./verify-migration.sh
    
    echo ""
    echo "🎉 移行作業が完了しました！"
    echo ""
    echo "📋 次のステップ:"
    echo "1. .env ファイルの設定値を確認・調整"
    echo "2. 以下のコマンドでアプリケーションをテスト:"
    echo "   source venv/bin/activate"
    echo "   python -m uvicorn main:app --reload  # (APIサーバーがある場合)"
    echo "   npm run dev  # (フロントエンドがある場合)"
    echo "3. QUICKSTART-MIGRATION.md を参照してください"
else
    echo "❌ 移行作業をキャンセルしました"
    echo "📖 詳細は QUICKSTART-MIGRATION.md を参照してください"
fi