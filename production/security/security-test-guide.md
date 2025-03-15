# セキュリティテストガイド

## 概要
このドキュメントは、ITマネジメントシステムの本番環境移行前および運用中に実施すべきセキュリティテストの手順を詳細に解説します。脆弱性スキャン、ペネトレーションテスト、SSL/TLS設定評価などの主要なセキュリティテスト方法を網羅しています。

## 準備作業

### 必要なツール
- OWASP ZAP (Zed Attack Proxy)
- Burp Suite Community/Professional
- Nmap
- SSLyze
- Metasploit Framework (ペネトレーションテスト用)

### テスト環境
- ステージング環境（https://staging.it-management.example.com）で実施
- 本番と同等の設定・データ（個人情報はマスク処理）
- 隔離されたネットワークセグメント

## 1. OWASP ZAPを使用した脆弱性スキャン

### 1.1 基本スキャン

```bash
# Dockerコンテナでの実行
docker run --rm -v $(pwd)/zap-reports:/zap/reports owasp/zap2docker-stable zap-baseline.py \
  -t https://staging.it-management.example.com \
  -r zap-baseline-report.html
```

### 1.2 アクティブスキャン（認証機能を含む）

```bash
# コンテキストファイルの作成 (authentication.context)
# ZAP GUIで作成後エクスポートしたファイルを使用

# アクティブスキャンの実行
docker run --rm -v $(pwd)/zap-reports:/zap/reports -v $(pwd)/zap-config:/zap/config owasp/zap2docker-stable zap-full-scan.py \
  -t https://staging.it-management.example.com \
  -c /zap/config/authentication.context \
  -r zap-full-scan-report.html
```

### 1.3 APIスキャン

```bash
# OpenAPI仕様書の準備
# API仕様書をエクスポートし、/zap-config/apispec.jsonとして保存

# APIスキャンの実行
docker run --rm -v $(pwd)/zap-reports:/zap/reports -v $(pwd)/zap-config:/zap/config owasp/zap2docker-stable zap-api-scan.py \
  -t https://api.staging.it-management.example.com \
  -f openapi \
  -f /zap/config/apispec.json \
  -r zap-api-scan-report.html
```

### 1.4 結果の解析

スキャンレポートから以下のカテゴリの脆弱性を重点的に確認：
- インジェクション脆弱性（SQLi、XSS、XXE等）
- 認証と認可の問題
- セッション管理の問題
- クロスサイトリクエストフォージェリ（CSRF）
- セキュリティ設定ミス

## 2. ペネトレーションテスト

### 2.1 準備と範囲設定

ペネトレーションテストの実施前に必要な準備：
- テスト範囲の明確化（IPアドレス範囲、ドメイン、テスト可能な時間帯）
- 責任者の承認
- フォールバック計画の作成
- 本番データへのアクセス制限

### 2.2 インフラストラクチャテスト

```bash
# ポートスキャン
nmap -sS -A -T4 staging.it-management.example.com

# SSLテスト
sslyze --regular staging.it-management.example.com

# DNSセキュリティ確認
dig +short DNSKEY staging.it-management.example.com
dig +short DS staging.it-management.example.com
```

### 2.3 アプリケーションテスト

Burp Suiteを使用した手動テスト手順：
1. プロキシ設定
2. アプリケーション全体のクロール（サイトマップ作成）
3. 重要機能の特定と詳細テスト：
   - ログイン/認証フロー
   - アクセス制御
   - データ入力フォーム
   - ファイルアップロード機能
   - セッション管理
4. ビジネスロジックの脆弱性テスト

### 2.4 テスト結果のドキュメント化

テスト結果は以下の情報を含めて文書化：
- 脆弱性の詳細説明
- 再現手順
- 影響度（CVSS v3.1スコア）
- 証拠スクリーンショット
- 修正推奨事項

## 3. SSL Labsによるセキュリティ評価

### 3.1 SSL Labs評価の実施

1. [SSL Labs](https://www.ssllabs.com/ssltest/)にアクセス
2. 「New Test」タブを選択
3. テスト対象のドメイン（staging.it-management.example.com）を入力
4. 「Do not show the results on the boards」にチェック
5. 「Submit」をクリック
6. テスト完了まで待機（約2〜5分）

### 3.2 評価結果の分析

以下の項目を重点的に確認：
- 総合評価（目標：A+）
- 証明書の有効性
- プロトコルサポート（TLS 1.2および1.3のみ）
- 暗号スイート
- Perfect Forward Secrecy (PFS)のサポート
- HTTP Strict Transport Security (HSTS)の設定

### 3.3 改善方法

評価結果に基づいた改善例：
```nginx
# Nginxの設定例（nginx.confに追加）
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

## 4. セキュリティヘッダーチェック

### 4.1 セキュリティヘッダーの確認

```bash
# セキュリティヘッダーチェック
curl -I https://staging.it-management.example.com
```

### 4.2 推奨されるセキュリティヘッダー

以下のヘッダーが適切に設定されていることを確認：
- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy

### 4.3 ヘッダー設定の修正例

```nginx
# Nginxの設定例（nginx.confに追加）
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://trusted-cdn.com; style-src 'self' https://trusted-cdn.com; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.it-management.example.com;" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## 5. セキュリティテスト自動化

### 5.1 CI/CDパイプラインへの組み込み

Azure DevOpsパイプラインへの組み込み例：

```yaml
# azure-pipelines.ymlに追加
- job: SecurityTests
  displayName: 'セキュリティテスト'
  pool:
    vmImage: 'ubuntu-latest'
  steps:
  - script: |
      docker run --rm -v $(pwd)/security-reports:/zap/reports owasp/zap2docker-stable zap-baseline.py -t https://staging.it-management.example.com -r security-report.html
    displayName: 'OWASP ZAPスキャン'
  
  - script: |
      docker run --rm -v $(pwd)/security-reports:/reports sslyze/sslyze --json_out=/reports/ssl-report.json staging.it-management.example.com
    displayName: 'SSL設定スキャン'
  
  - task: PublishBuildArtifacts@1
    inputs:
      pathToPublish: 'security-reports'
      artifactName: 'security-scan-results'
    displayName: 'セキュリティスキャン結果の公開'
```

### 5.2 定期的なスキャンスケジュール

```bash
# cronジョブの例 (毎週日曜日の午前3時に実行)
0 3 * * 0 /usr/local/bin/security-scan.sh >> /var/log/security-scan.log 2>&1
```

security-scan.sh:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
REPORT_DIR="/var/security-reports/$DATE"

mkdir -p $REPORT_DIR

# ZAPスキャン
docker run --rm -v $REPORT_DIR:/zap/reports owasp/zap2docker-stable zap-baseline.py \
  -t https://it-management.example.com \
  -r zap-baseline-report.html

# SSL設定スキャン
docker run --rm -v $REPORT_DIR:/reports sslyze/sslyze \
  --json_out=/reports/ssl-report.json \
  it-management.example.com

# 結果サマリーの生成
echo "Security Scan Results for $DATE" > $REPORT_DIR/summary.txt
grep -A 5 "FAIL" $REPORT_DIR/zap-baseline-report.html >> $REPORT_DIR/summary.txt

# 通知（例：メール送信）
mail -s "Security Scan Results - $DATE" security-team@example.com < $REPORT_DIR/summary.txt
```

## 6. 脆弱性への対応

### 6.1 脆弱性管理プロセス

1. 脆弱性の評価（CVSS v3.1スコアを使用）
   - 重大 (9.0-10.0): 24時間以内に対応
   - 高 (7.0-8.9): 72時間以内に対応
   - 中 (4.0-6.9): 2週間以内に対応
   - 低 (0.1-3.9): 次回リリースで対応

2. 対応計画の立案
   - 一時的な緩和策の実装
   - 永続的な修正の開発
   - テストと検証

3. 修正の適用
   - ホットフィックス（重大/高）
   - 定期リリース（中/低）

4. 報告とフィードバック
   - 関係者への報告
   - 教訓の共有と対策の水平展開

### 6.2 脆弱性追跡システム

脆弱性情報の管理には専用のIssueトラッカー（例：Jira）を使用し、以下の情報を記録：
- 脆弱性ID（内部管理用）
- 発見日
- 脆弱性の種類
- 影響を受けるコンポーネント
- 重大度
- 現在のステータス
- 担当者
- 修正予定日
- 修正完了日