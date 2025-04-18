# 認証およびレポート機能ガイド

**注意**: Microsoft認証（Azure AD認証）は廃止されました。

## 認証について

システムは標準的なユーザー名/パスワード認証のみを使用しています。Microsoft Entra IDとの連携機能は、セキュリティとメンテナンス上の理由から廃止されました。

### 認証方法

1. ログインページにアクセスする
2. ユーザー名とパスワードを入力
3. 「ログイン」ボタンをクリックする

### テスト用アカウント

開発環境では、以下のテストユーザーが利用可能です:

| ユーザー名 | パスワード | 権限 |
|------------|------------|------|
| admin      | admin      | グローバル管理者 |
| user       | user       | 一般ユーザー |
| guest      | guest      | ゲスト |

## レポート機能

システムには以下の新しいレポート機能が実装されています:

### レポートタイプ

- **日次レポート**: 毎日のシステム状態とアクティビティのレポート
- **週次レポート**: 週間のシステム状態と詳細分析（毎週月曜日に生成）
- **月次レポート**: 月間のシステム状態とパフォーマンス指標（毎月1日に生成）

### レポート内容

以下のタイプのレポートが利用可能です:

- システム概要
- インシデント概要
- ユーザーアクティビティ
- セキュリティイベント
- パフォーマンス指標
- ユーザーログイン状況（ユーザー追加/削除/ロール変更、ログイン/ログアウト時刻履歴）

### レポート出力方法

レポートには二つの出力方法があります:

#### 1. 自動生成レポート

設定した頻度（日次、週次、月次）に応じて自動的にレポートが生成されます。管理者はシステム設定ページでこれらの設定を変更できます。

#### 2. 即時レポート生成

「レポート」ページから、任意のタイプと期間を指定して即時にレポートを生成できます。

### レポート配信機能

#### UI表示

- 生成されたすべてのレポートはWEB UI上ですぐに確認できます
- レポート一覧ページからレポートを選択して詳細を表示できます
- PDF形式でダウンロードすることも可能です

#### メール配信

- 設定ページでメール配信を有効にしたユーザーにレポートを自動送信します
- ユーザーは受け取りたいレポートのタイプと頻度を設定できます
- 即時レポート生成時にもメール配信オプションを選択可能です

### レポート設定

レポート設定は「設定」ページの「レポート設定」タブから変更できます:

1. レポート生成設定（有効/無効、頻度など）
2. レポート配信設定（メール配信の有効/無効、受け取るレポートのタイプなど）
3. 即時レポート生成オプション

### トラブルシューティング

レポートが正常に生成されない場合:

1. ブラウザのキャッシュをクリアする
2. アプリケーションを再起動する
3. メール配信に問題がある場合はメールアドレスの設定を確認する
4. ログファイル（logs/backend.log）を確認する

問題が解決しない場合は、システム管理者にお問い合わせください。
