# This file makes apps.backend a package

from flask import Flask

from flask_session import Session

app = Flask(__name__)

# セッションの設定
app.config["SESSION_TYPE"] = "filesystem"  # ファイルシステムにセッションを保存
app.config["SESSION_PERMANENT"] = False
app.config["SECRET_KEY"] = "your-secret-key"  # 適切な秘密鍵に変更してください

# Flask-Sessionの初期化
Session(app)
