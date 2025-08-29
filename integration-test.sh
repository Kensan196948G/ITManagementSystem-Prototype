#!/bin/bash

echo "=========================================="
echo "ITサービス管理システム 統合テスト"
echo "=========================================="
echo ""

# カラーコード
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# テスト結果カウンター
PASS=0
FAIL=0

# テスト関数
run_test() {
    local name=$1
    local cmd=$2
    local expected=$3
    
    echo -n "テスト: $name ... "
    result=$(eval $cmd 2>&1)
    
    if [[ $result == *"$expected"* ]]; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  期待値: $expected"
        echo "  実際: $result"
        ((FAIL++))
    fi
}

echo "1. バックエンドAPIテスト"
echo "----------------------------------------"

# Health Check
run_test "Health Check API" \
    "curl -s http://localhost:5001/api/health | jq -r '.status'" \
    "healthy"

# Status API
run_test "Status API" \
    "curl -s http://localhost:5001/api/status | jq -r '.status'" \
    "ok"

# Incidents API (GET)
run_test "Incidents GET API" \
    "curl -s http://localhost:5001/api/incidents | jq '. | length'" \
    "3"

# Create Incident (POST)
run_test "Incidents POST API" \
    "curl -s -X POST http://localhost:5001/api/incidents -H 'Content-Type: application/json' -d '{\"title\":\"Test Incident\",\"description\":\"Test\"}' | jq -r '.message'" \
    "Incident created successfully"

# Problems API
run_test "Problems API" \
    "curl -s http://localhost:5001/api/problems | jq '. | length'" \
    "2"

# Users API
run_test "Users API" \
    "curl -s http://localhost:5001/api/users | jq '. | length'" \
    "4"

# Database Test
run_test "Database Connection" \
    "curl -s http://localhost:5001/api/db-test | jq -r '.database'" \
    "connected"

echo ""
echo "2. フロントエンドサーバーテスト"
echo "----------------------------------------"

# Frontend Server
run_test "Frontend Server" \
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:5174/" \
    "200"

echo ""
echo "3. サービス間連携テスト"
echo "----------------------------------------"

# CORS Headers Check
run_test "CORS Headers" \
    "curl -s -I http://localhost:5001/api/health | grep -i 'access-control-allow-origin' | wc -l" \
    "1"

echo ""
echo "=========================================="
echo "テスト結果サマリー"
echo "=========================================="
echo -e "成功: ${GREEN}$PASS${NC}"
echo -e "失敗: ${RED}$FAIL${NC}"

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}✓ すべてのテストが成功しました！${NC}"
    echo ""
    echo "システムステータス:"
    echo "  - バックエンドAPI: http://localhost:5001"
    echo "  - フロントエンド: http://localhost:5174"
    echo "  - データベース: SQLite (接続済み)"
    echo ""
    echo "次のステップ:"
    echo "  1. ブラウザで http://localhost:5174 にアクセス"
    echo "  2. APIドキュメント: http://localhost:5001/api/docs (実装予定)"
    echo "  3. 開発を続行: CLAUDE.mdとREADME.mdを参照"
    exit 0
else
    echo -e "\n${RED}✗ 一部のテストが失敗しました${NC}"
    echo "失敗したテストを確認して修正してください。"
    exit 1
fi