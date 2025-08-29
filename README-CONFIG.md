# 環境変数による設定完全外部化システム

このシステムでは、すべての環境固有設定を環境変数で完全に外部化し、どの環境でも`.env`ファイルの変更だけで動作するように設計されています。

## 📋 目次

- [概要](#概要)
- [設定ファイル構成](#設定ファイル構成)
- [環境別設定](#環境別設定)
- [使用方法](#使用方法)
- [設定項目詳細](#設定項目詳細)
- [トラブルシューティング](#トラブルシューティング)

## 🎯 概要

### 特徴
- ✅ **完全ポータビリティ**: 絶対パス依存なし
- ✅ **環境別設定**: development/production/test/staging対応
- ✅ **安全なデフォルト値**: 設定不備時の安全な動作
- ✅ **設定バリデーション**: 起動時の包括的な設定検証
- ✅ **機能フラグ管理**: 動的な機能ON/OFF制御
- ✅ **詳細エラーメッセージ**: 設定エラー時の解決ガイド

### アーキテクチャ
```
src/config/
├── ConfigManager.ts       # 基本設定管理
├── DatabaseConfig.ts      # データベース設定
├── ServerConfig.ts        # サーバー設定  
├── ServicesConfig.ts      # 外部サービス設定
├── EnvironmentManager.ts  # 環境別設定・機能フラグ管理
└── index.ts              # 統合初期化システム
```

## 📁 設定ファイル構成

### 環境変数ファイル
```
.env.example       # 設定テンプレート（全項目documented）
.env              # 基本設定
.env.local        # ローカル専用設定（git ignore）
.env.development  # 開発環境設定
.env.production   # 本番環境設定
.env.test         # テスト環境設定
```

### 設定優先順位
1. 環境変数 (`process.env`)
2. `.env.{NODE_ENV}.local`
3. `.env.{NODE_ENV}`
4. `.env.local`
5. `.env`
6. デフォルト値

## 🌍 環境別設定

### 開発環境 (development)
```bash
NODE_ENV=development
APP_DEBUG=true
DB_NAME=itsm_dev
SERVER_HTTPS_ENABLED=false
LOG_CONSOLE_ENABLED=true
DEV_HOT_RELOAD=true
```

### 本番環境 (production)
```bash
NODE_ENV=production
APP_DEBUG=false
DB_SSL=true
SERVER_HTTPS_ENABLED=true
SECURITY_HSTS_ENABLED=true
PROD_CLUSTER_ENABLED=true
```

### テスト環境 (test)
```bash
NODE_ENV=test
DB_NAME=itsm_test
TEST_PARALLEL=true
LOG_LEVEL=error
METRICS_ENABLED=false
```

## 🚀 使用方法

### 1. 初回セットアップ
```bash
# 1. 設定ファイルをコピー
cp .env.example .env

# 2. 環境に応じて設定値を編集
vim .env

# 3. 依存関係をインストール
npm install

# 4. データベースを準備
# PostgreSQL例:
createdb itsm_dev

# 5. アプリケーション起動
npm run dev
```

### 2. TypeScriptでの設定取得
```typescript
import { configManager, environmentManager } from './config';

// 基本的な設定取得
const config = configManager.getConfig();
console.log(config.server.port);

// 特定設定の取得
const dbConfig = configManager.get('database');
const serverConfig = configManager.get('server');

// 環境判定
if (environmentManager.isProduction()) {
  // 本番環境固有の処理
}

// 機能フラグ
if (environmentManager.isFeatureEnabled('twoFactorAuth')) {
  // 2FA機能の実装
}

// 環境変数取得（オーバーライド対応）
const customValue = environmentManager.getEnvValue('CUSTOM_SETTING', 'default');
```

### 3. アプリケーション初期化
```typescript
import AppInitializer from './config';

async function main() {
  try {
    // 全システム初期化
    const app = await AppInitializer.start();
    
    // 個別初期化も可能
    const { config, database, server, services } = app;
    
  } catch (error) {
    console.error('初期化エラー:', error);
  }
}
```

### 4. ヘルスチェック
```typescript
// システム全体のヘルスチェック
const health = await AppInitializer.healthCheck();
console.log(health.status); // 'healthy' | 'degraded' | 'unhealthy'

// 個別サービスのヘルスチェック
const dbHealth = await DatabaseConfig.healthCheck();
const servicesHealth = await servicesConfig.healthCheck();
```

## ⚙️ 設定項目詳細

### データベース設定
| 項目 | 環境変数 | デフォルト | 説明 |
|------|----------|------------|------|
| タイプ | `DB_TYPE` | `postgresql` | データベースタイプ |
| ホスト | `DB_HOST` | `localhost` | データベースホスト |
| ポート | `DB_PORT` | `5432` | データベースポート |
| 接続プール最小 | `DB_POOL_MIN` | `2` | 最小接続数 |
| 接続プール最大 | `DB_POOL_MAX` | `20` | 最大接続数 |
| SSL有効 | `DB_SSL` | `false` | SSL接続の有効化 |

### サーバー設定
| 項目 | 環境変数 | デフォルト | 説明 |
|------|----------|------------|------|
| ホスト | `SERVER_HOST` | `localhost` | サーバーバインドアドレス |
| ポート | `SERVER_PORT` | `3000` | サーバーポート |
| HTTPS有効 | `SERVER_HTTPS_ENABLED` | `false` | HTTPS有効化 |
| CORS Origin | `SERVER_CORS_ORIGIN` | `*` | CORS許可オリジン |
| リクエストタイムアウト | `SERVER_REQUEST_TIMEOUT` | `30000` | タイムアウト時間(ms) |

### 外部サービス設定
| 項目 | 環境変数 | デフォルト | 説明 |
|------|----------|------------|------|
| SMTPホスト | `SMTP_HOST` | `smtp.gmail.com` | メールサーバー |
| SMTPポート | `SMTP_PORT` | `587` | メールサーバーポート |
| Redisホスト | `REDIS_HOST` | `localhost` | Redisサーバー |
| ストレージタイプ | `STORAGE_TYPE` | `local` | ファイルストレージ |
| AWS S3バケット | `STORAGE_AWS_BUCKET` | - | S3バケット名 |

### セキュリティ設定
| 項目 | 環境変数 | デフォルト | 説明 |
|------|----------|------------|------|
| JWTシークレット | `JWT_SECRET` | **必須** | JWT署名キー |
| セッションシークレット | `SESSION_SECRET` | **必須** | セッション暗号化キー |
| HSTS有効 | `SECURITY_HSTS_ENABLED` | `true` | HSTS設定 |
| CSP有効 | `SECURITY_CSP_ENABLED` | `true` | CSP設定 |

### 機能フラグ
| 項目 | 環境変数 | デフォルト | 説明 |
|------|----------|------------|------|
| ユーザー登録 | `FEATURE_USER_REGISTRATION` | `true` | ユーザー登録機能 |
| メール確認 | `FEATURE_EMAIL_VERIFICATION` | `true` | メール確認機能 |
| 2FA | `FEATURE_TWO_FACTOR_AUTH` | `false` | 二要素認証 |
| 監査ログ | `FEATURE_AUDIT_LOG` | `true` | 監査ログ機能 |
| 通知 | `FEATURE_NOTIFICATIONS` | `true` | 通知機能 |

### ログ設定
| 項目 | 環境変数 | デフォルト | 説明 |
|------|----------|------------|------|
| レベル | `LOG_LEVEL` | `info` | ログレベル |
| ファイル出力 | `LOG_FILE_ENABLED` | `true` | ファイルログ |
| コンソール出力 | `LOG_CONSOLE_ENABLED` | `true` | コンソールログ |
| 最大ファイルサイズ | `LOG_FILE_MAX_SIZE` | `10m` | ログファイルサイズ |

## 🔧 高度な設定

### 環境固有オーバーライド
```bash
# .env.production.local（本番環境のローカル設定）
DB_HOST=prod-db-server.internal
REDIS_HOST=prod-redis-cluster.internal
```

### 動的機能フラグ
```json
// config/features.json
{
  "experimentalFeature": true,
  "betaUserInterface": false,
  "advancedAnalytics": true
}
```

### 設定バリデーション
```typescript
// カスタムバリデーション
const validation = environmentManager.validateConfiguration();
if (!validation.isValid) {
  console.error('設定エラー:', validation.errors);
}
```

### 設定の動的変更
```typescript
// 機能フラグの動的変更
environmentManager.enableFeature('newFeature');
environmentManager.disableFeature('oldFeature');

// 設定値の取得
const customTimeout = environmentManager.getEnvNumber('CUSTOM_TIMEOUT', 5000);
```

## 🛠 トラブルシューティング

### 起動エラー

#### 1. 設定エラー
```
ConfigError: 環境変数 JWT_SECRET が設定されていません
```
**解決方法**: `.env`ファイルでJWT_SECRETを設定
```bash
JWT_SECRET=your-super-secret-jwt-key-here
```

#### 2. データベース接続エラー
```
データベース接続に失敗しました: connection refused
```
**解決方法**:
- データベースサーバーが起動していることを確認
- DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORDを確認
- ファイアウォール設定を確認

#### 3. ポート使用済みエラー
```
ポート 3000 は既に使用されています
```
**解決方法**:
```bash
# 異なるポートを使用
SERVER_PORT=3001
```

### 設定デバッグ

#### 設定値の確認
```bash
# デバッグモードで起動
APP_DEBUG=true npm run dev
```

#### 安全な設定情報の表示
```typescript
const safeConfig = AppInitializer.getSafeConfig();
console.log(JSON.stringify(safeConfig, null, 2));
```

#### ヘルスチェック実行
```bash
curl http://localhost:3000/health
```

### よくある問題

| 問題 | 原因 | 解決方法 |
|------|------|----------|
| SSL証明書エラー | 証明書パス不正 | `SERVER_SSL_CERT_PATH`, `SERVER_SSL_KEY_PATH`を確認 |
| メール送信失敗 | SMTP設定不備 | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`を確認 |
| Redis接続失敗 | Redis未起動 | Redisサーバーを起動するか`CACHE_TYPE=memory`に変更 |
| ファイルアップロード失敗 | ディレクトリ権限 | `UPLOAD_DESTINATION`の権限を確認 |

## 📚 参考資料

### 関連ドキュメント
- [データベース設定ガイド](./docs/database-setup.md)
- [セキュリティ設定ガイド](./docs/security-config.md)
- [デプロイメントガイド](./docs/deployment.md)

### 外部ドキュメント
- [TypeORM Configuration](https://typeorm.io/data-source-options)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)

---

💡 **ヒント**: このシステムは完全にポータブルです。新しい環境にコピーした後は、適切な`.env`ファイルを作成するだけで動作します。