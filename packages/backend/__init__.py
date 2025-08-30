# packages/backend/__init__.py
# バックエンドパッケージの初期化ファイル
# Flaskアプリケーションのファクトリ関数をここに定義予定

from flask import Flask

from .config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ここでDB初期化やBlueprint登録を行う
    # 例:
    # from .routes import api_bp
    # app.register_blueprint(api_bp, url_prefix='/api')

    # セキュリティ関連の初期化
    from .routes.security import init_cors, init_limiter, security_bp

    init_limiter(app)
    init_cors(app)
    app.register_blueprint(security_bp)

    return app
