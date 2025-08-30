import os


def create_project_structure(base_path: str = ".") -> None:
    """
    プロジェクトの基本ディレクトリ構成を作成する関数。
    既に存在するディレクトリはスキップし、作成済みの旨をコンソールに出力する。

    Args:
        base_path (str): プロジェクトルートのパス。デフォルトはカレントディレクトリ。
    """
    directories = ["frontend", "backend", "common", "logs", "tests", "ci-cd"]

    for dir_name in directories:
        dir_path = os.path.join(base_path, dir_name)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
            print(f"ディレクトリ作成: {dir_path}")
        else:
            print(f"既に存在: {dir_path}")


if __name__ == "__main__":
    # カレントディレクトリをプロジェクトルートと仮定して実行
    create_project_structure()
