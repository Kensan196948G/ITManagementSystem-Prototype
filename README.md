# ITサービス管理システム (ITSM)

## 概要
このシステムは、ISO 20000・ISO 27001・ISO 27002に準拠したITサービス管理システムです。建設土木会社のIT部門向けに、ITサービスおよびシステムの運用を標準化し、効率的な管理を実現するためのプラットフォームを提供します。

## 目的
- IT部門（5名）の運用負担を軽減
- 業務の自動化率を向上（定型業務の80%以上）
- セキュリティ対策の強化（ISO 27001/27002準拠）
- システム可用性の向上

## 対象システム・サービス
- Microsoft 365（E3ライセンス）
- Active Directory（AD）
- Microsoft Entra ID（旧Azure AD）
- Entra Connect
- HENGEOINE（エンドポイントセキュリティ）
- Exchange Online
- DeskNet'sNeo（Appsuit含む）
- DirectCloud
- 外部データセンター内ファイルサーバ

## システム構成
### フロントエンド
- React.js
- Tailwind CSS
- Axios（API通信）

### バックエンド
- Python（Flask API）
- PowerShell（システム管理スクリプト）
- SQLite（データベース）

## 主要機能
1. システム運用管理自動化（監視・アラート・基本的トラブルシューティング）
2. レポーティング機能（定期レポート・メトリクス可視化）
3. ワークフロー管理（チケット・タスク・承認フロー）
4. データ分析（統計・トレンド分析）
5. セキュリティ管理（アクセス管理・監査）
6. APIパーミッション管理（Microsoft 365）

## インストール方法
```bash
# クローン
git clone https://github.com/yourusername/ITManagementSystem.git

# フロントエンド
cd frontend
npm install
npm start

# バックエンド
cd ../backend
pip install -r requirements.txt
python main.py
```

## 開発者向け情報
- コーディング規約：PEP8（Python）、StandardJS（JavaScript）
- バージョン管理：Git/GitHub
- CI/CD：GitHub Actions

## ライセンス
このプロジェクトは企業内部利用を目的としており、プロプライエタリライセンスの下で管理されています。無断での複製・配布・改変は禁止されています。
