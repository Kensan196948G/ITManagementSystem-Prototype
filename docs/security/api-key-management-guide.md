# APIキー管理ガイド
## ITサービス管理システム - ISO 27001/27002準拠

### 目次
1. [概要](#概要)
2. [セキュリティ要件](#セキュリティ要件)
3. [APIキー分類](#apiキー分類)
4. [キー生成ガイドライン](#キー生成ガイドライン)
5. [キーローテーション手順](#キーローテーション手順)
6. [保存と管理](#保存と管理)
7. [アクセス制御](#アクセス制御)
8. [監査とログ](#監査とログ)
9. [インシデント対応](#インシデント対応)
10. [チェックリスト](#チェックリスト)

---

## 概要

本ガイドは、ITサービス管理システムにおけるAPIキーの適切な管理手順を定義し、ISO 27001/27002の要件に準拠したセキュリティ対策を提供します。

### 適用範囲
- JWT秘密鍵
- セッション秘密鍵
- CSRF保護トークン
- データベース認証情報
- 外部サービスAPIキー
- 暗号化キー

---

## セキュリティ要件

### ISO 27002 準拠要件

#### 10.1.1 暗号化制御ポリシー
- **強度要件**: 最低256ビットの暗号化強度
- **アルゴリズム**: AES-256-GCM推奨
- **キー長**: JWT秘密鍵64文字以上、セッション鍵32文字以上

#### 10.1.2 鍵管理
- **キーライフサイクル**: 生成→配布→保存→ローテーション→廃棄
- **ローテーション頻度**: 
  - JWT秘密鍵: 90日
  - セッション鍵: 30日
  - 暗号化キー: 180日

#### 12.4.1 ログ記録
- **監査要件**: 全キー操作の記録
- **保持期間**: 7年間
- **アクセス記録**: 成功/失敗ログ

---

## APIキー分類

### クリティカルレベル (Level 1)
**影響度**: システム全体への影響

| キー種別 | 用途 | ローテーション | 最小長 |
|---------|------|---------------|--------|
| JWT_SECRET | JWT署名・検証 | 90日 | 64文字 |
| DB_PASSWORD | データベース認証 | 90日 | 16文字 |
| ENCRYPTION_KEY | データ暗号化 | 180日 | 32文字 |

### ハイレベル (Level 2)
**影響度**: 機能レベルへの影響

| キー種別 | 用途 | ローテーション | 最小長 |
|---------|------|---------------|--------|
| SESSION_SECRET | セッション管理 | 30日 | 32文字 |
| CSRF_SECRET | CSRF保護 | 30日 | 32文字 |
| OAUTH_CLIENT_SECRET | OAuth認証 | 180日 | - |

### ミディアムレベル (Level 3)
**影響度**: 外部サービス連携

| キー種別 | 用途 | ローテーション | 最小長 |
|---------|------|---------------|--------|
| SMTP_PASS | メール送信 | 180日 | - |
| REDIS_PASSWORD | キャッシュ認証 | 90日 | 16文字 |
| API_KEY | 外部API認証 | 180日 | 32文字 |

---

## キー生成ガイドライン

### 生成方法

#### 1. JWT秘密鍵 (64文字以上)
```bash
# OpenSSLを使用
openssl rand -base64 64

# Pythonスクリプトを使用
python -c "import secrets, base64; print(base64.b64encode(secrets.token_bytes(48)).decode())"
```

#### 2. セッション秘密鍵 (32文字以上)
```bash
# OpenSSLを使用
openssl rand -base64 32

# 専用スクリプト使用
python scripts/key_rotation.py --rotate session
```

#### 3. データベースパスワード (16文字以上)
```bash
# 複雑なパスワード生成
python -c "import secrets, string; chars=string.ascii_letters+string.digits+'!@#$%^&*()'; print(''.join(secrets.choice(chars) for _ in range(20)))"
```

### 生成要件

#### 強度基準
- **エントロピー**: 最低128ビット
- **文字セット**: 英数字 + 記号
- **パターン回避**: 辞書語、連続文字、繰り返し禁止

#### 検証基準
```python
# 強度検証例
def validate_key_strength(key):
    checks = {
        'length': len(key) >= 32,
        'uppercase': any(c.isupper() for c in key),
        'lowercase': any(c.islower() for c in key),  
        'digits': any(c.isdigit() for c in key),
        'special': any(c in '!@#$%^&*()_+-=' for c in key)
    }
    return sum(checks.values()) >= 4
```

---

## キーローテーション手順

### 自動ローテーション

#### 1. スケジュール確認
```bash
# ローテーション状況確認
python scripts/key_rotation.py --schedule

# 詳細レポート生成
python scripts/key_rotation.py --report
```

#### 2. 単一キーローテーション
```bash
# JWT秘密鍵をローテーション
python scripts/key_rotation.py --rotate jwt --update-env

# セッション鍵をローテーション
python scripts/key_rotation.py --rotate session --update-env
```

#### 3. 一括ローテーション
```bash
# 全キーローテーション
python scripts/key_rotation.py --rotate all --update-env
```

### 手動ローテーション手順

#### ステップ1: バックアップ作成
```bash
# 現在の設定をバックアップ
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 暗号化バックアップ作成
python scripts/security_validator.py --backup-keys
```

#### ステップ2: 新キー生成
```bash
# セキュアキー生成
JWT_NEW=$(openssl rand -base64 64)
SESSION_NEW=$(openssl rand -base64 32)
CSRF_NEW=$(openssl rand -base64 32)
```

#### ステップ3: グレースピリオド設定
```bash
# 新旧キーの並行運用期間設定（推奨：24時間）
export JWT_SECRET_OLD=$JWT_SECRET
export JWT_SECRET_NEW=$JWT_NEW
```

#### ステップ4: 検証とデプロイ
```bash
# セキュリティ検証実行
python scripts/security_validator.py --verify-rotation

# 段階的デプロイ（Blue-Green）
./scripts/deploy-with-key-rotation.sh
```

---

## 保存と管理

### 環境別管理

#### 開発環境
- **場所**: `.env` ファイル（ローカルのみ）
- **暗号化**: 不要（開発専用値）
- **アクセス**: 開発者のみ

#### ステージング環境
- **場所**: 環境変数または暗号化ファイル
- **暗号化**: AES-256推奨
- **アクセス**: QAチーム、DevOpsチーム

#### 本番環境
- **場所**: Key Management Service (KMS)
- **暗号化**: HSM（Hardware Security Module）推奨
- **アクセス**: 最小権限の原則

### 暗号化保存

#### AWS Systems Manager Parameter Store
```bash
# セキュアストリング形式で保存
aws ssm put-parameter \
  --name "/itsm/production/jwt-secret" \
  --value "$JWT_SECRET" \
  --type "SecureString" \
  --key-id "arn:aws:kms:region:account:key/key-id"
```

#### Azure Key Vault
```bash
# Key Vaultへの保存
az keyvault secret set \
  --vault-name "itsm-keyvault" \
  --name "jwt-secret" \
  --value "$JWT_SECRET"
```

#### HashiCorp Vault
```bash
# Vault KVストアへの保存
vault kv put secret/itsm/jwt-secret value="$JWT_SECRET"
```

---

## アクセス制御

### RBAC (Role-Based Access Control)

#### ロール定義
```yaml
roles:
  security-admin:
    permissions:
      - key:create
      - key:read
      - key:update
      - key:delete
      - key:rotate
    
  devops-engineer:
    permissions:
      - key:read
      - key:rotate
    
  developer:
    permissions:
      - key:read (development only)
```

### MFA要件
- **Level 1キー**: MFA必須
- **Level 2キー**: MFA推奨
- **Level 3キー**: パスワード認証

### アクセスログ
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "user": "admin@company.com",
  "action": "key:rotate",
  "resource": "JWT_SECRET",
  "source_ip": "192.168.1.100",
  "mfa_verified": true,
  "result": "success"
}
```

---

## 監査とログ

### 監査要件

#### ログ記録項目
- **キーアクセス**: 読み取り、更新、削除
- **ローテーション**: 新旧キー情報、実行者、理由
- **認証失敗**: 不正アクセス試行
- **システムイベント**: 自動ローテーション、期限切れ

#### ログ形式
```json
{
  "event_id": "uuid",
  "timestamp": "ISO8601",
  "severity": "INFO|WARN|ERROR|CRITICAL",
  "component": "KeyManager",
  "action": "action_name",
  "user": "user_id",
  "resource": "key_name",
  "details": {
    "old_key_hash": "sha256_hash",
    "new_key_hash": "sha256_hash",
    "rotation_reason": "scheduled|manual|compromise"
  },
  "result": "success|failure",
  "error_message": "optional"
}
```

### 監査レポート

#### 月次レポート
```bash
# 月次監査レポート生成
python scripts/generate_audit_report.py --period monthly --output audit_$(date +%Y%m).pdf
```

#### 年次セキュリティレビュー
- キーローテーション履歴分析
- アクセスパターン分析
- セキュリティインシデント分析
- 改善提案

---

## インシデント対応

### キー漏洩時の対応手順

#### 即座対応 (0-1時間)
1. **影響範囲特定**
   ```bash
   # 漏洩キーの使用履歴確認
   python scripts/audit_key_usage.py --key-hash $COMPROMISED_KEY_HASH
   ```

2. **緊急ローテーション**
   ```bash
   # 緊急キーローテーション
   python scripts/emergency_key_rotation.py --key jwt --reason compromise
   ```

3. **アクセス遮断**
   ```bash
   # 旧キーの即座無効化
   python scripts/revoke_key.py --key-id $COMPROMISED_KEY_ID
   ```

#### 短期対応 (1-24時間)
1. **セッション無効化**
2. **影響ユーザー通知**
3. **システム監視強化**

#### 長期対応 (1-30日)
1. **根本原因分析**
2. **セキュリティ対策強化**
3. **プロセス改善**

### 自動アラート設定

#### 監視対象
```yaml
alerts:
  - name: "Key Near Expiry"
    condition: "key_age > rotation_period - 7d"
    severity: "warning"
    
  - name: "Failed Key Access"
    condition: "failed_attempts > 5 in 1h"
    severity: "critical"
    
  - name: "Unusual Key Access"
    condition: "access_from_new_location OR access_outside_hours"
    severity: "warning"
```

---

## チェックリスト

### デプロイ前セキュリティチェック

#### ✅ キー強度検証
- [ ] JWT秘密鍵：64文字以上のBase64文字列
- [ ] セッション鍵：32文字以上のBase64文字列  
- [ ] データベースパスワード：16文字以上の複雑パスワード
- [ ] 全キーが弱いパターンを含まない

#### ✅ 設定検証
- [ ] 本番環境でHTTPS有効化
- [ ] セッションセキュアフラグ設定
- [ ] データベースSSL接続有効化
- [ ] セキュリティヘッダー設定

#### ✅ アクセス制御
- [ ] Key Management Service設定
- [ ] RBAC設定完了
- [ ] MFA有効化（Level 1キー）
- [ ] 監査ログ有効化

### 運用時チェック

#### 🔄 定期実行（月次）
- [ ] キーローテーション状況確認
- [ ] アクセスログ監査
- [ ] セキュリティアラート確認
- [ ] バックアップ整合性確認

#### 📊 四半期レビュー
- [ ] セキュリティポリシー見直し
- [ ] インシデント分析
- [ ] 脆弱性評価
- [ ] 改善計画策定

### セキュリティ検証コマンド

```bash
# 環境変数セキュリティ検証
python scripts/security_validator.py

# キーローテーション状況確認
python scripts/key_rotation.py --schedule

# セキュリティ監査実行
python scripts/security_audit.py --comprehensive

# 脆弱性スキャン
python scripts/vulnerability_scan.py --target production
```

---

## 関連ドキュメント

- [セキュリティチェックリスト](./security-checklist.md)
- [インシデント対応手順書](./incident-response-plan.md)
- [本番環境セキュリティガイド](../production/security-guide.md)
- [監査ログ分析ガイド](./audit-log-analysis.md)

---

**最終更新**: 2024年8月29日  
**承認者**: セキュリティ責任者  
**次回レビュー**: 2024年11月29日