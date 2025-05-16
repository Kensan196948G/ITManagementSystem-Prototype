# WebUI 設計仕様書

## 1. フロントエンド構成

本WebUIは、一般的なIT管理システムの機能に基づき、以下の主要ページで構成されます。既存の `/packages/frontend/components/ui/` にあるUIコンポーネント（shadcn/uiなどを想定）を再利用し、各ページ固有のコンポーネントは `/packages/frontend/components/` 以下にページ構成ごとに整理して配置します。

### ページ構成案

-   **ダッシュボード (`/dashboard`)**
    -   システムの全体概要、主要メトリクス、最新のアラートなどを表示
-   **インシデント管理 (`/incidents`)**
    -   インシデントの一覧表示、詳細確認、新規登録、ステータス更新
-   **変更管理 (`/changes`)**
    -   変更リクエストの一覧表示、詳細確認、新規登録、承認フロー
-   **CMDB (`/cmdb`)**
    -   構成アイテムの一覧表示、詳細確認、関連情報の管理
-   **レポート (`/reports`)**
    -   各種レポートの生成、表示、ダウンロード
-   **設定 (`/settings`)**
    -   ユーザー管理、システム設定、マスタデータ管理

### コンポーネントリスト案

各ページは、以下の主要コンポーネントで構成されることを想定します。`/packages/frontend/components/ui/` に存在する汎用コンポーネント（Table, Form, Button, Card, Dialog, DropdownMenuなど）は再利用します。

-   **ダッシュボード:**
    -   StatusCard (UI Card + データ表示)
    -   IncidentTrendChart (UI Chart + データ表示)
    -   ServiceStatusList (UI Table + データ表示)
    -   IncidentsList (UI Table + データ表示)
-   **インシデント管理:**
    -   IncidentsTable (UI Table + データ表示/操作)
    -   IncidentDetail (UI Card/Form + データ表示/編集)
    -   NewIncidentForm (UI Form + データ入力)
-   **変更管理:**
    -   ChangesTable (UI Table + データ表示/操作)
    -   ChangeDetail (UI Card/Form + データ表示/編集)
    -   ChangeRequestForm (UI Form + データ入力)
    -   ChangeCalendar (UI Calendar + データ表示)
-   **CMDB:**
    -   ConfigItemsTable (UI Table + データ表示/操作)
    -   ConfigItemDetail (UI Card/Form + データ表示/編集)
    -   TopologyView (グラフ描画ライブラリ + データ表示)
-   **レポート:**
    -   ReportsList (UI Table + データ表示)
    -   ReportGeneratorForm (UI Form + データ入力)
    -   各種Chartコンポーネント (UI Chart + データ表示)
-   **設定:**
    -   UsersList (UI Table + データ表示/操作)
    -   UserForm (UI Form + データ入力/編集)
    -   SettingsForm (UI Form + データ入力/編集)

### フォルダ構成案 (packages/frontend/components/)

```
packages/frontend/components/
├── ui/             # 既存の汎用UIコンポーネント
├── dashboard/
│   ├── StatusCard.tsx
│   ├── IncidentTrendChart.tsx
│   ├── ServiceStatusList.tsx
│   └── IncidentsList.tsx
├── incidents/
│   ├── IncidentsTable.tsx
│   ├── IncidentDetail.tsx
│   └── NewIncidentForm.tsx
├── changes/
│   ├── ChangesTable.tsx
│   ├── ChangeDetail.tsx
│   ├── ChangeRequestForm.tsx
│   └── ChangeCalendar.tsx
├── cmdb/
│   ├── ConfigItemsTable.tsx
│   ├── ConfigItemDetail.tsx
│   └── TopologyView.tsx
├── reports/
│   ├── ReportsList.tsx
│   ├── ReportGeneratorForm.tsx
│   └── charts/
│       ├── IncidentsByServiceChart.tsx
│       └── ...
└── settings/
    ├── UsersList.tsx
    ├── UserForm.tsx
    └── SettingsForm.tsx
```

## 2. バックエンドAPI仕様

フロントエンドの各機能が必要とするバックエンドAPIのエンドポイント、HTTPメソッド、およびデータ構造の概要を定義します。バックエンドはPython (Flask) で実装されることを想定します。

### APIエンドポイント案

-   **ダッシュボード関連:**
    -   `GET /api/dashboard/summary`: 全体概要、主要メトリクス
    -   `GET /api/dashboard/incidents/latest`: 最新インシデントリスト
    -   `GET /api/dashboard/service-status`: サービスステータスリスト
    -   `GET /api/dashboard/incidents/trend`: インシデントトレンドデータ
-   **インシデント管理:**
    -   `GET /api/incidents`: インシデント一覧取得 (フィルタリング、ページネーション考慮)
    -   `GET /api/incidents/{id}`: 特定インシデント詳細取得
    -   `POST /api/incidents`: 新規インシデント登録
    -   `PUT /api/incidents/{id}`: インシデント更新
    -   `DELETE /api/incidents/{id}`: インシデント削除
-   **変更管理:**
    -   `GET /api/changes`: 変更リクエスト一覧取得
    -   `GET /api/changes/{id}`: 特定変更リクエスト詳細取得
    -   `POST /api/changes`: 新規変更リクエスト登録
    -   `PUT /api/changes/{id}`: 変更リクエスト更新
    -   `DELETE /api/changes/{id}`: 変更リクエスト削除
    -   `GET /api/changes/calendar`: 変更カレンダーデータ取得
-   **CMDB:**
    -   `GET /api/cmdb/items`: 構成アイテム一覧取得
    -   `GET /api/cmdb/items/{id}`: 特定構成アイテム詳細取得
    -   `POST /api/cmdb/items`: 新規構成アイテム登録
    -   `PUT /api/cmdb/items/{id}`: 構成アイテム更新
    -   `DELETE /api/cmdb/items/{id}`: 構成アイテム削除
    -   `GET /api/cmdb/items/{id}/topology`: 構成アイテム関連情報取得 (トポロジー表示用)
-   **レポート:**
    -   `GET /api/reports`: レポート一覧取得
    -   `POST /api/reports/generate`: レポート生成 (パラメータをリクエストボディで送信)
    -   `GET /api/reports/{id}/data`: 特定レポートデータ取得
    -   `GET /api/reports/{id}/download`: 特定レポートダウンロード
-   **設定:**
    -   `GET /api/settings/users`: ユーザー一覧取得
    -   `GET /api/settings/users/{id}`: 特定ユーザー詳細取得
    -   `POST /api/settings/users`: 新規ユーザー登録
    -   `PUT /api/settings/users/{id}`: ユーザー更新
    -   `DELETE /api/settings/users/{id}`: ユーザー削除
    -   `GET /api/settings/system`: システム設定取得
    -   `PUT /api/settings/system`: システム設定更新

### データ構造例 (JSON Schema風)

**インシデントオブジェクト例:**

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "description": "インシデントID" },
    "title": { "type": "string", "description": "件名" },
    "description": { "type": "string", "description": "詳細" },
    "status": { "type": "string", "enum": ["Open", "InProgress", "Resolved", "Closed"], "description": "ステータス" },
    "severity": { "type": "string", "enum": ["High", "Medium", "Low"], "description": "重要度" },
    "reported_at": { "type": "string", "format": "date-time", "description": "報告日時" },
    "resolved_at": { "type": "string", "format": "date-time", "nullable": true, "description": "解決日時" },
    "assigned_to": { "type": "string", "nullable": true, "description": "担当者ID" },
    "service_id": { "type": "string", "description": "関連サービスID" }
  },
  "required": ["id", "title", "description", "status", "severity", "reported_at"]
}
```

**APIレスポンス例 (一覧取得):**

```json
{
  "type": "object",
  "properties": {
    "data": {
      "type": "array",
      "items": { "$ref": "#/components/schemas/Incident" } // 上記インシデントオブジェクトを参照
    },
    "total": { "type": "integer", "description": "総件数" },
    "page": { "type": "integer", "description": "現在のページ番号" },
    "limit": { "type": "integer", "description": "1ページあたりの件数" }
  }
}
```

## 3. エラー修復ループに関するアーキテクチャ考慮事項

本システムには、コードの仮想実行、エラー分析、Debugモードへの委譲、Codeモードでの修正反映、再実行を繰り返す自律型エラー修復ループが組み込まれます。

-   **フロー概要:**
    -   実行管理モジュールがコードを仮想実行。
    -   エラーまたは警告が発生した場合、エラー分析モジュールが原因を特定。
    -   Debugモードにエラー情報と分析結果を委譲し、修正案を生成。
    -   Codeモードに修正案を委譲し、コードに反映。
    -   実行管理モジュールが修正されたコードを再実行。
    -   このサイクルを成功または最大試行回数（10回）に達するまで繰り返す。
-   **モジュールの責任分離:**
    -   実行管理: コード実行、結果監視
    -   エラー分析: エラーログ解析、原因特定
    -   修復プランニング: 修正案生成 (Debugモードの役割)
    -   コード適用: コード修正 (Codeモードの役割)
    -   ロギング: 実行ログ、エラーログ、修正差分ログの記録
-   **拡張性:**
    -   将来的なMicrosoft Graph APIエラーやPowerShellスクリプトの失敗にも対応できるよう、エラー分析モジュールはエラーの種類に応じた解析ロジックを追加しやすい構造とします。
    -   修復プランニングおよびコード適用モジュールは、異なる言語やフレームワークにも対応できるよう抽象化されたインターフェースを持つことが望ましいです。

## 4. 他モードへの設計方針伝達

-   **Debugモード:**
    -   エラー分析モジュールから渡されるエラー情報と分析結果を基に、具体的なコード修正案を生成する責任を担います。
    -   修正案はCodeモードが理解し、適用可能な形式（例: 差分情報、修正後のコードスニペット）で出力する必要があります。
-   **Codeモード:**
    -   Debugモードから渡される修正案を、実際のコードファイルに正確に反映する責任を担います。
    -   修正適用後、実行管理モジュールが再実行できるよう、コードの整合性を保つ必要があります。
-   **Orchestratorモード:**
    -   エラー修復ループ全体のフローを管理し、各モジュール（実行管理、エラー分析）および他モード（Debug, Code）間の連携を調整する責任を担います。
    -   修復サイクルの開始、停止、繰り返し回数の管理、ログの保存指示などを行います。