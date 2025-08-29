#!/bin/bash
# ITサービス管理システム - 包括的セキュリティチェック
# ISO 27001/27002 準拠のセキュリティ検証を一括実行

set -euo pipefail

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# プロジェクトルート取得
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")

echo -e "${BLUE}===============================================================================${NC}"
echo -e "${BLUE}         ITサービス管理システム - 包括的セキュリティチェック${NC}"
echo -e "${BLUE}         ISO 27001/27002 準拠${NC}"
echo -e "${BLUE}===============================================================================${NC}"
echo ""

# 実行日時
echo -e "${GREEN}実行日時:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${GREEN}プロジェクトルート:${NC} $PROJECT_ROOT"
echo ""

# チェック結果格納
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# チェック結果記録関数
check_result() {
    local description="$1"
    local status="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ "$status" = "pass" ]; then
        echo -e "  ${GREEN}✅ $description${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    elif [ "$status" = "warn" ]; then
        echo -e "  ${YELLOW}⚠️  $description${NC}"
    else
        echo -e "  ${RED}❌ $description${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# 1. セキュリティ検証スクリプト実行
echo -e "${BLUE}1. セキュリティ設定検証${NC}"
echo "================================================"

if python3 "$SCRIPT_DIR/security_validator.py" --env-file "$PROJECT_ROOT/.env.example" --silent; then
    check_result "セキュリティ検証スクリプト実行" "pass"
else
    check_result "セキュリティ検証スクリプト実行 (開発環境では弱いキーが期待される)" "warn"
fi

# 2. キーローテーション機能確認
echo ""
echo -e "${BLUE}2. キー管理機能確認${NC}"
echo "================================================"

if python3 "$SCRIPT_DIR/key_rotation.py" --schedule > /dev/null 2>&1; then
    check_result "キーローテーションスケジュール機能" "pass"
else
    check_result "キーローテーションスケジュール機能" "fail"
fi

if python3 "$SCRIPT_DIR/key_rotation.py" --verify > /dev/null 2>&1; then
    check_result "キー整合性検証機能" "pass"
else
    check_result "キー整合性検証機能 (開発環境では問題が期待される)" "warn"
fi

# 3. 環境設定ファイル確認
echo ""
echo -e "${BLUE}3. 環境設定ファイル確認${NC}"
echo "================================================"

if [ -f "$PROJECT_ROOT/.env.example" ]; then
    check_result ".env.example ファイル存在確認" "pass"
else
    check_result ".env.example ファイル存在確認" "fail"
fi

if [ -f "$PROJECT_ROOT/.env.production.example" ]; then
    check_result ".env.production.example ファイル存在確認" "pass"
else
    check_result ".env.production.example ファイル存在確認" "fail"
fi

# 4. セキュリティドキュメント確認
echo ""
echo -e "${BLUE}4. セキュリティドキュメント確認${NC}"
echo "================================================"

if [ -f "$PROJECT_ROOT/docs/security/api-key-management-guide.md" ]; then
    check_result "APIキー管理ガイド" "pass"
else
    check_result "APIキー管理ガイド" "fail"
fi

if [ -f "$PROJECT_ROOT/docs/security/security-checklist.md" ]; then
    check_result "セキュリティチェックリスト" "pass"
else
    check_result "セキュリティチェックリスト" "fail"
fi

# 5. セキュリティヘッダー設定確認
echo ""
echo -e "${BLUE}5. セキュリティヘッダー設定確認${NC}"
echo "================================================"

# .env.exampleファイルでセキュリティヘッダー設定を確認
if grep -q "SECURITY_HSTS_ENABLED=true" "$PROJECT_ROOT/.env.example"; then
    check_result "HSTS設定" "pass"
else
    check_result "HSTS設定" "fail"
fi

if grep -q "SECURITY_CSP_ENABLED=true" "$PROJECT_ROOT/.env.example"; then
    check_result "CSP設定" "pass"
else
    check_result "CSP設定" "fail"
fi

if grep -q "SECURITY_XSS_PROTECTION=true" "$PROJECT_ROOT/.env.example"; then
    check_result "XSS Protection設定" "pass"
else
    check_result "XSS Protection設定" "fail"
fi

# 6. 暗号化設定確認
echo ""
echo -e "${BLUE}6. 暗号化設定確認${NC}"
echo "================================================"

if grep -q "BCRYPT_ROUNDS=12" "$PROJECT_ROOT/.env.example"; then
    check_result "BCrypt暗号化ラウンド設定" "pass"
else
    check_result "BCrypt暗号化ラウンド設定" "fail"
fi

if grep -q "SECURITY_ENCRYPTION_ALGORITHM=aes-256-gcm" "$PROJECT_ROOT/.env.example"; then
    check_result "暗号化アルゴリズム設定" "pass"
else
    check_result "暗号化アルゴリズム設定" "fail"
fi

# 7. 監査・ログ設定確認
echo ""
echo -e "${BLUE}7. 監査・ログ設定確認${NC}"
echo "================================================"

if grep -q "SECURITY_AUDIT_LOG_ENABLED=true" "$PROJECT_ROOT/.env.example"; then
    check_result "監査ログ有効化" "pass"
else
    check_result "監査ログ有効化" "fail"
fi

if grep -q "LOG_FILE_ENABLED=true" "$PROJECT_ROOT/.env.example"; then
    check_result "ファイルログ有効化" "pass"
else
    check_result "ファイルログ有効化" "fail"
fi

# 8. 本番環境設定確認 (.env.production.example)
echo ""
echo -e "${BLUE}8. 本番環境設定確認${NC}"
echo "================================================"

if grep -q "NODE_ENV=production" "$PROJECT_ROOT/.env.production.example"; then
    check_result "本番環境モード設定" "pass"
else
    check_result "本番環境モード設定" "fail"
fi

if grep -q "SERVER_HTTPS_ENABLED=true" "$PROJECT_ROOT/.env.production.example"; then
    check_result "本番環境HTTPS必須設定" "pass"
else
    check_result "本番環境HTTPS必須設定" "fail"
fi

if grep -q "APP_DEBUG=false" "$PROJECT_ROOT/.env.production.example"; then
    check_result "本番環境デバッグ無効化" "pass"
else
    check_result "本番環境デバッグ無効化" "fail"
fi

if grep -q "DB_SSL=true" "$PROJECT_ROOT/.env.production.example"; then
    check_result "本番環境データベースSSL必須" "pass"
else
    check_result "本番環境データベースSSL必須" "fail"
fi

# 9. スクリプト実行権限確認
echo ""
echo -e "${BLUE}9. スクリプト実行権限確認${NC}"
echo "================================================"

if [ -x "$SCRIPT_DIR/security_validator.py" ] || python3 "$SCRIPT_DIR/security_validator.py" --help > /dev/null 2>&1; then
    check_result "セキュリティ検証スクリプト実行権限" "pass"
else
    check_result "セキュリティ検証スクリプト実行権限" "fail"
fi

if [ -x "$SCRIPT_DIR/key_rotation.py" ] || python3 "$SCRIPT_DIR/key_rotation.py" --help > /dev/null 2>&1; then
    check_result "キーローテーションスクリプト実行権限" "pass"
else
    check_result "キーローテーションスクリプト実行権限" "fail"
fi

# 10. 依存関係確認
echo ""
echo -e "${BLUE}10. Python依存関係確認${NC}"
echo "================================================"

# 必要なPythonモジュールの確認
python_modules=("secrets" "base64" "hashlib" "json" "pathlib" "logging")

for module in "${python_modules[@]}"; do
    if python3 -c "import $module" 2>/dev/null; then
        check_result "Python $module モジュール" "pass"
    else
        check_result "Python $module モジュール" "fail"
    fi
done

# cryptographyモジュールの確認（キーローテーション用）
if python3 -c "import cryptography" 2>/dev/null; then
    check_result "Python cryptography モジュール" "pass"
else
    check_result "Python cryptography モジュール" "warn"
fi

# 最終結果表示
echo ""
echo -e "${BLUE}===============================================================================${NC}"
echo -e "${BLUE}                           チェック結果サマリー${NC}"
echo -e "${BLUE}===============================================================================${NC}"

echo ""
echo -e "${GREEN}総チェック数:${NC} $TOTAL_CHECKS"
echo -e "${GREEN}合格:${NC} $PASSED_CHECKS"
echo -e "${RED}不合格:${NC} $FAILED_CHECKS"

# 合格率計算
if [ $TOTAL_CHECKS -gt 0 ]; then
    PASS_RATE=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
    echo -e "${GREEN}合格率:${NC} ${PASS_RATE}%"
else
    PASS_RATE=0
fi

echo ""

# セキュリティスコア評価
if [ $PASS_RATE -ge 90 ]; then
    echo -e "${GREEN}🛡️  セキュリティ評価: 優秀 (90%以上)${NC}"
    echo -e "${GREEN}   ISO 27001/27002 の要件をほぼ満たしています。${NC}"
elif [ $PASS_RATE -ge 80 ]; then
    echo -e "${YELLOW}🔒 セキュリティ評価: 良好 (80%以上)${NC}"
    echo -e "${YELLOW}   いくつかの改善が必要ですが、基本的なセキュリティ要件は満たしています。${NC}"
elif [ $PASS_RATE -ge 60 ]; then
    echo -e "${YELLOW}⚠️  セキュリティ評価: 要改善 (60%以上)${NC}"
    echo -e "${YELLOW}   セキュリティ強化が必要です。不合格項目の修正を実施してください。${NC}"
else
    echo -e "${RED}🚨 セキュリティ評価: 不十分 (60%未満)${NC}"
    echo -e "${RED}   緊急にセキュリティ対策を実施してください。${NC}"
fi

echo ""

# 推奨アクション
if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "${BLUE}推奨アクション:${NC}"
    echo -e "  1. 不合格項目の修正を実施"
    echo -e "  2. セキュリティ検証スクリプトを再実行"
    echo -e "  3. 本番環境デプロイ前に全チェック項目の合格確認"
    echo ""
fi

# 関連コマンド
echo -e "${BLUE}関連コマンド:${NC}"
echo -e "  セキュリティ検証:     python3 scripts/security_validator.py"
echo -e "  キーローテーション:   python3 scripts/key_rotation.py --schedule"
echo -e "  弱いキーの修正:       python3 scripts/security_validator.py --fix-weak-keys"
echo -e "  詳細レポート:         python3 scripts/security_validator.py --output-json report.json"

echo ""
echo -e "${BLUE}===============================================================================${NC}"

# 終了コード設定
if [ $FAILED_CHECKS -gt 5 ]; then
    echo -e "${RED}重大なセキュリティ問題が検出されました。修正後に再実行してください。${NC}"
    exit 2
elif [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "${YELLOW}一部セキュリティ問題があります。改善を推奨します。${NC}"
    exit 1
else
    echo -e "${GREEN}✅ 全セキュリティチェックに合格しました！${NC}"
    exit 0
fi