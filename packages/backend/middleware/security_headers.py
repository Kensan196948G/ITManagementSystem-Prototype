# 🔒 Security Update: セキュリティヘッダー強化ミドルウェア実装
from flask import Response, request


def security_headers_middleware(app):
    """Flaskアプリケーションにセキュリティヘッダーを追加するミドルウェア

    以下のセキュリティヘッダーを自動追加:
    - Content Security Policy (CSP)
    - XSS Protection
    - Strict Transport Security (HSTS)
    - Frame Options
    - Content Type Options
    - Referrer Policy
    """

    @app.after_request
    def apply_security_headers(response: Response) -> Response:
        # 基本セキュリティヘッダー
        response.headers["Strict-Transport-Security"] = (
            "max-age=63072000; includeSubDomains; preload"
        )
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # 最小限のCSPポリシー
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; connect-src 'self'"
        )

        return response

    return app
