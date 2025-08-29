# 開発環境セットアップガイド

本ドキュメントは、開発環境をセットアップするための手順について記述します。必要なソフトウェア、依存関係のインストール、プロジェクトのビルド方法、ローカルでの実行方法などを含みます。

## 前提条件

- Python 3.11 以上
- Node.js 18 以上
- npm 9 以上

## セットアップ手順

1. リポジトリをクローンします。
2. ルートディレクトリで `npm install` を実行し、モノレポの依存関係をインストールします。
3. バックエンドの依存関係をインストールします。
   ```powershell
   cd packages/backend
   pip install -r requirements.txt
   ```
4. バックエンドのテストは以下のスクリプトで実行してください。
   ```powershell
   cd e:/kitting/ITManagementSystem-Prototype
   .\scripts\run_backend_tests.ps1
   ```
5. フロントエンドのテストは以下のコマンドで実行してください。
   ```bash
   npm run test --workspace=frontend -- --coverage
   ```
6. 開発サーバーの起動は以下のコマンドで行います。
   ```bash
   npm start
   ```

## 注意事項

- バックエンドのテストは必ず `scripts/run_backend_tests.ps1` を使用し、明示的に `packages/backend` ディレクトリで実行してください。
- CI/CD環境でも同様に、バックエンドテストは `scripts/run_backend_tests.ps1` を呼び出す形で実行してください。
## バックエンドテストの実行方法

ローカル環境およびCI環境でのバックエンドテスト実行時に、カレントディレクトリが`frontend`に変更される問題を回避するため、以下の運用ルールを設けています。

- **ローカル環境**  
  バックエンドのテストは、PowerShellスクリプト `scripts/run_backend_tests.ps1` を使用して実行してください。  
  このスクリプトは `packages/backend` ディレクトリに移動してから `pytest` を実行するため、カレントディレクトリの問題を回避できます。

- **CI環境**  
  GitHub ActionsのCI/CDパイプラインでは、`packages/backend` ディレクトリを作業ディレクトリとして設定し、直接 `pytest` を実行しています。  
  これにより、同様にカレントディレクトリの問題を回避しています。

この運用ルールに従うことで、バックエンドテストの実行が安定し、カレントディレクトリの影響を受けずにテストが実行されます。