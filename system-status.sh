#!/bin/bash

echo "=========================================="
echo "ITサービス管理システム - 完全動作確認"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}■ サービス稼働状況${NC}"
echo "----------------------------------------"

# フロントエンド
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.3.135:5174/)
if [ "$frontend_status" = "200" ]; then
    echo -e "${GREEN}✓${NC} フロントエンド: http://192.168.3.135:5174 (HTTP $frontend_status)"
else
    echo -e "${RED}✗${NC} フロントエンド: http://192.168.3.135:5174 (HTTP $frontend_status)"
fi

# バックエンドAPI
backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.3.135:5001/api/health)
if [ "$backend_status" = "200" ]; then
    echo -e "${GREEN}✓${NC} バックエンドAPI: http://192.168.3.135:5001 (HTTP $backend_status)"
else
    echo -e "${RED}✗${NC} バックエンドAPI: http://192.168.3.135:5001 (HTTP $backend_status)"
fi

echo ""
echo -e "${BLUE}■ ネットワーク接続状態${NC}"
echo "----------------------------------------"
ss -tuln | grep -E ":(5174|5001)" | while read line; do
    port=$(echo $line | grep -oE ":[0-9]+" | tail -1 | tr -d ':')
    proto=$(echo $line | awk '{print $1}')
    addr=$(echo $line | awk '{print $5}')
    echo -e "  ポート ${GREEN}$port${NC} - $proto - $addr"
done

echo ""
echo -e "${BLUE}■ アクセス情報${NC}"
echo "----------------------------------------"
echo -e "  ${GREEN}フロントエンド${NC}: http://192.168.3.135:5174"
echo -e "  ${GREEN}バックエンドAPI${NC}: http://192.168.3.135:5001"
echo ""
echo "  ブラウザで以下のURLにアクセスしてください："
echo -e "  ${BLUE}http://192.168.3.135:5174${NC}"
echo ""

if [ "$frontend_status" = "200" ] && [ "$backend_status" = "200" ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ システムは完全に稼働しています！${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
elif [ "$frontend_status" = "200" ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ フロントエンドは正常にアクセス可能です！${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo -e "${RED}⚠ 一部のサービスに問題があります${NC}"
fi