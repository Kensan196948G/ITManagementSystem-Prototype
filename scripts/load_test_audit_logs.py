from locust import HttpUser, between, task
from prometheus_client import Counter, Histogram, start_http_server

# Prometheusメトリクス設定
REQUEST_COUNT = Counter("audit_log_requests_total", "Total audit log API requests")
REQUEST_LATENCY = Histogram(
    "audit_log_request_latency_seconds", "Audit log API latency"
)


class AuditLogUser(HttpUser):
    wait_time = between(0.1, 0.5)  # 100-500ms間隔でリクエスト

    @task
    def post_audit_log(self):
        # 暗号化処理を含むAPIエンドポイントテスト
        with REQUEST_LATENCY.time():
            response = self.client.post(
                "/api/v1/audit_logs",
                json={
                    "event_type": "user_login",
                    "user_id": "test_user",
                    "ip_address": "192.168.1.1",
                    "metadata": {"browser": "chrome"},
                },
                headers={"Authorization": "Bearer test_token"},
            )
            REQUEST_COUNT.inc()

            # レスポンス検証
            if response.status_code != 201:
                self.environment.events.request_failure.fire(
                    request_type="POST",
                    name="/api/v1/audit_logs",
                    response_time=response.elapsed.total_seconds(),
                    exception=Exception(
                        f"Unexpected status code: {response.status_code}"
                    ),
                )
            else:
                self.environment.events.request_success.fire(
                    request_type="POST",
                    name="/api/v1/audit_logs",
                    response_time=response.elapsed.total_seconds(),
                    response_length=len(response.content),
                )


if __name__ == "__main__":
    # Prometheusメトリクスサーバー起動 (ポート9090)
    start_http_server(9090)
