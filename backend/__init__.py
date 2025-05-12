from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from backend.config import settings # Configクラスからsettingsインスタンスに変更

db = SQLAlchemy()

def create_app():
    print(f"[DEBUG] __init__.py: create_app() called.") # 修復サイクル7: デバッグログ追加
    app = Flask(__name__)
    print(f"[DEBUG] __init__.py: Flask instance created.") # 修復サイクル7: デバッグログ追加
    # Pydantic Settingsオブジェクトから設定を読み込む
    # settings.model_dump() を使用して辞書を取得し、大文字キーで設定
    for key, value in settings.model_dump().items():
        app.config[key.upper()] = value
    db.init_app(app)
    
    # Blueprint登録
    print(f"[DEBUG] __init__.py: Registering blueprint auth_bp...") # 修復サイクル7: デバッグログ追加
    from backend.routes.auth import auth_bp
    app.register_blueprint(auth_bp) # auth_bp には /auth プレフィックスがない場合があるため、url_prefix は省略
    print(f"[DEBUG] __init__.py: Blueprint auth_bp registered.") # 修復サイクル7: デバッグログ追加

    print(f"[DEBUG] __init__.py: Registering blueprint security_bp...") # 修復サイクル7: デバッグログ追加
    from backend.routes.security import security_bp
    app.register_blueprint(security_bp) # security_bp にもプレフィックスがない場合があるため、url_prefix は省略
    print(f"[DEBUG] __init__.py: Blueprint security_bp registered.")

    print(f"[DEBUG] __init__.py: Registering blueprint incidents_bp...")
    from backend.routes.incidents import incidents_bp
    app.register_blueprint(incidents_bp) # incidents_bp には /api/incidents プレフィックスが設定されている
    print(f"[DEBUG] __init__.py: Blueprint incidents_bp registered.")

    # 他のBlueprintも同様に登録
    # from backend.routes.system import system_bp
    # app.register_blueprint(system_bp)
    # from backend.routes.reports import reports_bp
    # app.register_blueprint(reports_bp)
    # from backend.routes.workflow import workflow_bp
    # app.register_blueprint(workflow_bp)


    # 修復サイクル7: /health エンドポイント追加
    print(f"[DEBUG] __init__.py: Adding /health endpoint...")
    @app.route('/health')
    def health():
        print("[DEBUG] __init__.py: /health endpoint called.")
        return "OK", 200
    print(f"[DEBUG] __init__.py: /health endpoint added.")

    # 修復サイクル7: / (ルート) エンドポイント追加
    print(f"[DEBUG] __init__.py: Adding / (root) endpoint...")
    @app.route('/')
    def index():
        print("[DEBUG] __init__.py: / (root) endpoint called.")
        return "IT Management System Backend is running.", 200
    print(f"[DEBUG] __init__.py: / (root) endpoint added.")

    print(f"[DEBUG] __init__.py: create_app() finished.")
    return app