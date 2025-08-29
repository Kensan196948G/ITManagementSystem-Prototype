#!/bin/bash

echo "=========================================="
echo "ITサービス管理システム - 最終動作確認"
echo "IPアドレス: 192.168.3.135"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1. サービス稼働状況"
echo "----------------------------------------"

# フロントエンド確認
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.3.135:5174/)
if [ "$frontend_status" = "200" ]; then
    echo -e "${GREEN}✓ フロントエンド${NC}: http://192.168.3.135:5174 (HTTP $frontend_status)"
else
    echo -e "${RED}✗ フロントエンド${NC}: http://192.168.3.135:5174 (HTTP $frontend_status)"
fi

# バックエンドAPI確認
backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.3.135:5001/api/health)
if [ "$backend_status" = "200" ]; then
    echo -e "${GREEN}✓ バックエンドAPI${NC}: http://192.168.3.135:5001 (HTTP $backend_status)"
    echo "  APIレスポンス:"
    curl -s http://192.168.3.135:5001/api/health | python3 -m json.tool | head -5 | sed 's/^/    /'
else
    echo -e "${RED}✗ バックエンドAPI${NC}: http://192.168.3.135:5001 (HTTP $backend_status)"
fi

echo ""
echo "2. ポートリスニング状況"
echo "----------------------------------------"
ss -tuln | grep -E ":(5001|5174)" | while read line; do
    port=$(echo $line | grep -oE ":[0-9]+" | tail -1)
    echo "  $port - $(echo $line | awk '{print $1}') - $(echo $line | awk '{print $5}')"
done

echo ""
echo "3. プロセス状況"
echo "----------------------------------------"
echo "  Node.js プロセス数: $(ps aux | grep -c node)"
echo "  Python プロセス数: $(ps aux | grep -c python)"

echo ""
echo "=========================================="
echo "アクセス方法"
echo "=========================================="
echo ""
echo "📱 ブラウザでアクセス:"
echo "   ${GREEN}http://192.168.3.135:5174${NC}"
echo ""
echo "🔧 APIテスト:"
echo "   curl http://192.168.3.135:5001/api/health"
echo ""
echo "📝 利用可能なAPIエンドポイント:"
echo "   GET  http://192.168.3.135:5001/api/health"
echo "   GET  http://192.168.3.135:5001/api/status"
echo "   GET  http://192.168.3.135:5001/api/incidents"
echo "   POST http://192.168.3.135:5001/api/incidents"
echo "   GET  http://192.168.3.135:5001/api/problems"
echo "   GET  http://192.168.3.135:5001/api/users"
echo ""

if [ "$frontend_status" = "200" ] && [ "$backend_status" = "200" ]; then
    echo -e "${GREEN}✅ システムは正常に稼働しています！${NC}"
else
    echo -e "${YELLOW}⚠️ 一部のサービスに問題があります${NC}"
fi