# モニタリング設定ガイド

## 概要
ITマネジメントシステム本番環境のモニタリング設定について説明します。

## モニタリングコンポーネント

- Prometheus: メトリクス収集
- Grafana: ダッシュボード表示
- AlertManager: アラート通知
- Loki: ログ集約

## Prometheusの設定

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - "alerts.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'it_management'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['backend:5000', 'frontend:3000']
    
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    
  - job_name: 'sql_exporter'
    static_configs:
      - targets: ['sql-exporter:9399']
```

## アラート設定

```yaml
# alerts.yml
groups:
  - name: it_management_alerts
    rules:
      - alert: HighErrorRate
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "高エラーレート検出"
          description: "過去5分間のエラーレートが5%を超えています"

      - alert: APILatencyHigh
        expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{handler="/api/v1"}[5m])) by (le)) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API応答時間遅延"
          description: "API v1のP95レイテンシが1秒を超えています"

      - alert: LowDiskSpace
        expr: node_filesystem_free_bytes{fstype=~"ext4|xfs"} / node_filesystem_size_bytes{fstype=~"ext4|xfs"} < 0.1
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "ディスク容量不足"
          description: "{{ $labels.instance }}のディスク空き容量が10%を下回っています"
```

## Grafanaダッシュボード

### システム概要ダッシュボード
- システム全体の健全性表示
- エラーレート、レイテンシ、リクエスト数のグラフ
- CPU、メモリ、ディスク使用率の表示

### APIパフォーマンスダッシュボード
- エンドポイント別レスポンスタイム
- HTTP ステータスコード分布
- リクエスト頻度ヒートマップ

## ログ管理設定

### Lokiの設定
```yaml
# loki.yml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2023-01-01
      store: boltdb
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb:
    directory: /data/loki/index
  filesystem:
    directory: /data/loki/chunks
```

## アラート通知設定
```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/TXXXXXXXX/BXXXXXXXX/XXXXXXXX'

route:
  group_by: ['alertname', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h
  receiver: 'team-slack'
  routes:
  - match:
      severity: critical
    receiver: 'team-pager'

receivers:
- name: 'team-slack'
  slack_configs:
  - channel: '#alerts'
    send_resolved: true
    title: '{{ .GroupLabels.alertname }}'
    text: "{{ range .Alerts }}{{ .Annotations.description }}\n{{ end }}"

- name: 'team-pager'
  slack_configs:
  - channel: '#alerts-critical'
    send_resolved: true
  pagerduty_configs:
  - service_key: '<pagerduty-service-key>'
```

## 運用開始後チェックリスト
- [ ] すべてのサーバーでnode-exporterが動作していることを確認
- [ ] アラート通知が適切に設定されていることを確認
- [ ] ログローテーションが正しく設定されていることを確認
- [ ] バックアップが正しく設定されていることを確認
- [ ] ダッシュボードがチーム全員からアクセス可能であることを確認