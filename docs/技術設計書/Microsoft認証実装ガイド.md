# Microsoft認証実装ガイド
<!-- 元ファイル: Microsoft-Auth-Implementation.md -->

## 実装フロー
```mermaid
sequenceDiagram
    User->>AzureAD: 認証要求
    AzureAD-->>User: 認証コード発行
    User->>Backend: コード送信
    Backend->>AzureAD: トークン取得