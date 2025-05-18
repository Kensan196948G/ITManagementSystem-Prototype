from .database import db

def create_all_tables():
    """
    DBの全テーブルを作成する関数
    """
    from .models.user import User
    from .models.incident import Incident
    from .models.problem import Problem
    from .models.system import System

    db.create_all()

if __name__ == "__main__":
    create_all_tables()
    print("全テーブルの作成が完了しました。")