import os
import subprocess
from concurrent.futures import ThreadPoolExecutor

def setup_environment():
    """環境自動セットアップを実行"""
    print("🔧 環境セットアップを開始します...")
    
    # バックエンド仮想環境作成
    if not os.path.exists("backend/.venv"):
        print("  🐍 バックエンド仮想環境を作成します...")
        subprocess.run(["python", "-m", "venv", "backend/.venv"], check=True)
    
    # バックエンド依存関係インストール
    pip_install = [
        "backend/.venv/Scripts/python" if os.name == 'nt' else "backend/.venv/bin/python",
        "-m", "pip", "install", "-r", "backend/requirements.txt"
    ]
    print("  📦 バックエンド依存関係をインストールします...")
    subprocess.run(pip_install, check=True)

    # フロントエンド依存関係インストール
    if os.path.exists("frontend/package.json"):
        print("  📦 フロントエンド依存関係をインストールします...")
        subprocess.run("npm install", cwd="frontend", shell=True, check=True)

def run_backend():
    """バックエンドサーバーを仮想環境内で起動"""
    python_exec = "backend/.venv/Scripts/python" if os.name == 'nt' else "backend/.venv/bin/python"
    subprocess.run(
        [python_exec, "backend/main.py", "--port=5000"],
        env={**os.environ, "FLASK_ENV": "development"},
        check=True
    )

def run_frontend():
    """フロントエンド開発サーバーを起動"""
    if os.path.exists("frontend/package.json"):
        subprocess.run(
            "npm start",
            cwd="frontend",
            shell=True,
            check=True
        )

if __name__ == "__main__":
    try:
        setup_environment()  # 初回環境セットアップ
        with ThreadPoolExecutor() as executor:
            print("🚀 システムを起動しています...")
            backend_future = executor.submit(run_backend)
            frontend_future = executor.submit(run_frontend)
            backend_future.result()
            frontend_future.result()
    except KeyboardInterrupt:
        print("\n🛑 システムを安全に停止します...")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ エラーが発生しました: {e}")