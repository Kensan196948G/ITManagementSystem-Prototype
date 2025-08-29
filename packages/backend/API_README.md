# ITSM FastAPI サーバー

ITサービス管理システム（ITSM）のFastAPI バックエンドサーバーです。ISO 20000/27001/27002準拠。

## 機能

- JWT認証システム
- CORS設定（localhost:3000, localhost:5173からのアクセス許可）
- SQLAlchemyデータベース接続（SQLite）
- ロール基準アクセス制御（RBAC）

## 起動方法

```bash
# 1. 依存関係のインストール
pip install -r requirements.txt

# 2. テストユーザーの作成
python create_test_user.py

# 3. サーバー起動
python run_fastapi.py
```

サーバーは http://localhost:8000 で起動します。

## API エンドポイント

### 認証

- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト  
- `GET /api/auth/me` - 現在のユーザー情報

### インシデント管理

- `GET /api/incidents` - インシデント一覧
- `POST /api/incidents` - インシデント作成
- `GET /api/incidents/{id}` - インシデント詳細
- `PUT /api/incidents/{id}` - インシデント更新
- `DELETE /api/incidents/{id}` - インシデント削除

### 問題管理

- `GET /api/problems` - 問題一覧
- `POST /api/problems` - 問題作成
- `GET /api/problems/{id}` - 問題詳細
- `PUT /api/problems/{id}` - 問題更新

### 変更要求管理

- `GET /api/changes` - 変更要求一覧
- `POST /api/changes` - 変更要求作成
- `GET /api/changes/{id}` - 変更要求詳細
- `PUT /api/changes/{id}` - 変更要求更新

### ユーザー管理

- `GET /api/users` - ユーザー一覧
- `POST /api/users` - ユーザー作成
- `GET /api/users/{id}` - ユーザー詳細
- `PUT /api/users/{id}` - ユーザー更新

## 認証

すべてのAPIエンドポイント（`/api/auth/login`以外）はJWTトークンによる認証が必要です。

### ログイン例

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'
```

レスポンス:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

### 認証が必要なエンドポイントの使用例

```bash
curl -X GET "http://localhost:8000/api/incidents" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

## API ドキュメント

サーバー起動後、以下のURLでSwagger UIによるAPI ドキュメントを確認できます：

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## テスト

```bash
python test_fastapi_server.py
```

## ヘルスチェック

```bash
curl http://localhost:8000/health
```

## エラーハンドリング

- 適切なHTTPステータスコード
- JSON形式のエラーレスポンス
- ログ出力

## セキュリティ機能

- JWTトークン生成・検証
- パスワードハッシュ化（bcrypt）
- ロール基準アクセス制御（RBAC）
- CORS設定