from flask import Flask, jsonify

from apps.backend.auth import auth_bp  # 修正ポイント: auth_bpをimport追加
from packages.backend.routes.reports import (
    reports_bp,
)  # 修正ポイント: reports_bpをimport追加


def create_app():
    app = Flask(__name__)
    app.config.from_object("config.DevelopmentConfig")

    app.register_blueprint(reports_bp)  # 修正ポイント: reports_bpをFlaskアプリに登録
    app.register_blueprint(auth_bp)  # 修正ポイント: auth_bpをFlaskアプリに登録

    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok"}), 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
