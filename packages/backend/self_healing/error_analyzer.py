# backend/self_healing/error_analyzer.py

# from .models.error import Error # Error クラスをインポートする場合


class ErrorAnalyzer:
    def analyze_errors(self, errors):
        """
        検出されたエラー情報のリストを受け取り、分析を行う。
        分析結果（種類、原因、重要度など）を追加したリストを返す。
        """
        analyzed_errors = []
        for error in errors:
            # 仮の分析ロジック
            error_type = "Unknown Error"
            estimated_cause = "Analysis needed"
            severity = "medium"

            if "FileNotFoundError" in error.get(
                "message", ""
            ) or "No such file or directory" in error.get("message", ""):
                error_type = "File Not Found"
                estimated_cause = "Missing file"
                severity = "high"
            elif "database" in error.get("message", "") or "SQLAlchemy" in error.get(
                "message", ""
            ):
                error_type = "Database Error"
                estimated_cause = "Database connection or query issue"
                severity = "high"
            elif "Authentication" in error.get("message", "") or "JWT" in error.get(
                "message", ""
            ):
                error_type = "Authentication Error"
                estimated_cause = "Invalid credentials or token"
                severity = "medium"
            # 他のエラーパターンを追加

            analyzed_error = error.copy()  # 元のエラー情報をコピー
            analyzed_error["type"] = error_type
            analyzed_error["estimated_cause"] = estimated_cause
            analyzed_error["severity"] = severity

            analyzed_errors.append(analyzed_error)

        return analyzed_errors
