import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from backend.__init__ import db, create_app
app = create_app()

with app.app_context():
    db.create_all()
    print("✅ データベーステーブルが正常に作成されました")