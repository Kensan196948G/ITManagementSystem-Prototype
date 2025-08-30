# backend/self_healing/error_detector.py

import re

from .models.error import (
    Error,
)  # models ディレクトリに Error クラスを定義後、コメント解除


class ErrorDetector:
    def __init__(self, log_file_path):
        self.log_file_path = log_file_path
        self.error_patterns = [
            re.compile(r"ERROR:"),
            re.compile(r"Exception:"),
            re.compile(r"Traceback:"),
        ]

    def detect_errors(self):
        """
        ログファイルを読み込み、定義されたパターンに一致するエラーを検出する。
        検出されたエラーを標準形式に変換してリストで返す。
        """
        detected_errors = []
        try:
            with open(self.log_file_path, "r", encoding="utf-8") as f:
                for line_num, line in enumerate(f, 1):
                    for pattern in self.error_patterns:
                        if pattern.search(line):
                            # 仮の標準形式。後で models/error.py に Error クラスを定義する。
                            error_info = {
                                "timestamp": "TODO: ログからタイムスタンプを抽出",
                                "message": line.strip(),
                                "file": self.log_file_path,
                                "line_number": line_num,
                                "raw_log": line,
                            }
                            # detected_errors.append(Error(**error_info)) # Error クラス使用時
                            detected_errors.append(error_info)  # 仮実装
                            break  # 一致したパターンが見つかったら次の行へ

        except FileNotFoundError:
            print(f"Error: Log file not found at {self.log_file_path}")
        except Exception as e:
            print(f"An error occurred while reading log file: {e}")

        return detected_errors


# TODO: models/error.py に Error クラスを定義するタスクを別途作成またはCodeモードに指示
