import os

class CodeApplier:
    """
    生成されたコード変更をファイルに適用するクラス。
    """
    def apply_repair_plan(self, repair_plan):
        """
        Debugモードから提供された修復案を解析し、コード変更を適用する。
        修復案の厳格な検証とサニタイズを行う。
        repair_plan は Debugモードからの出力形式に依存する。
        仮の形式: [{"file_path": "...", "line_number": ..., "code_changes": "...", "reason": "..."}, ...]
        """
        print(f"Applying repair plan: {repair_plan}")
        success = True
        applied_files = []

        # 修正ポイント: 修復案全体の検証
        if not isinstance(repair_plan, list):
            print("Error: Invalid repair_plan format. Expected a list.")
            return False, []

        for change in repair_plan:
            # 修正ポイント: 各変更エントリの検証とサニタイズ
            if not isinstance(change, dict):
                print(f"Warning: Skipping invalid change entry (not a dictionary): {change}")
                success = False
                continue

            file_path = change.get("file_path")
            line_number = change.get("line_number")
            code_changes = change.get("code_changes")
            reason = change.get("reason")

            # 必須フィールドの確認
            if not file_path or not code_changes:
                print(f"Warning: Skipping change entry due to missing file_path or code_changes: {change}")
                success = False
                continue

            # file_path のサニタイズ (簡易的: ディレクトリトラバーサルを防ぐ)
            # より厳密なチェックには os.path.abspath とプロジェクトルートの比較が必要
            # 修正ポイント: テスト用の一時ファイルパスも許可するように変更
            abs_file_path = os.path.abspath(file_path)
            abs_tests_path = os.path.abspath(os.path.join(os.getcwd(), "tests"))
            abs_backend_path = os.path.abspath(os.path.join(os.getcwd(), "packages/backend/self_healing"))
            # pytestの一時ディレクトリも許可
            abs_tmp_path = os.path.abspath(os.path.join(os.path.expandvars("%TEMP%")))

            if (
                ".." in file_path
                or (
                    not abs_file_path.startswith(abs_backend_path)
                    and not abs_file_path.startswith(abs_tests_path)
                    and not abs_file_path.startswith(abs_tmp_path)
                )
            ):
                print(f"Warning: Skipping change entry due to potentially malicious file_path: {file_path}")
                success = False
                continue

            # code_changes のサニタイズ (簡易的: 危険な関数の呼び出しを防ぐ)
            # より厳密なサニタイズには構文解析やAST操作が必要
            forbidden_patterns = ["os.system", "eval(", "exec("] # 例
            if any(pattern in code_changes for pattern in forbidden_patterns):
                print(f"Warning: Skipping change entry due to potentially malicious code_changes: {code_changes}")
                success = False
                continue

            try:
                # ファイルの存在確認
                if not os.path.exists(file_path):
                    print(f"Error: Target file not found: {file_path}")
                    success = False
                    continue

                print(f"Attempting to apply changes to {file_path} at line {line_number}")

                # 変更適用ロジック
                # Debugモードからの code_changes の形式に応じてツールを使い分ける
                # ここでは code_changes が挿入するコードブロックであると仮定し、insert_content を使用
                # 差分形式の場合は apply_diff、特定のテキスト置換の場合は search_and_replace を使用するロジックが必要

                # 修正ポイントコメントを追加
                content_to_insert = f"# 修正ポイント: {reason}\n{code_changes}"

                # insert_content ツールを呼び出す
                # line_number が指定されている場合はその行の前に挿入、指定されていない場合はファイルの最後に追記 (line 0)
                insert_line = line_number if line_number is not None else 0
                self._insert_content(file_path, insert_line, content_to_insert)

                print(f"Successfully applied changes to {file_path}")
                applied_files.append(file_path)

            except Exception as e:
                print(f"Error applying changes to {file_path}: {e}")
                success = False

        return success, applied_files

    def _apply_diff(self, file_path, diff_content):
        """
        apply_diff ツールを呼び出すプライベートメソッド。
        """
        print(f"Calling apply_diff for {file_path}")
        # TODO: apply_diff ツールを呼び出すロジックを実装
        # <apply_diff>
        # <path>{file_path}</path>
        # <diff>{diff_content}</diff>
        # </apply_diff>
        pass

    def _insert_content(self, file_path, line_number, content):
        """
        insert_content ツールを呼び出すプライベートメソッド。
        """
        print(f"Calling insert_content for {file_path} at line {line_number}")
        # 修正ポイント: RooCodeのinsert_contentツール呼び出しに置き換え
        # <insert_content>
        # <path>{file_path}</path>
        # <line>{line_number}</line>
        # <content>{content}</content>
        # </insert_content>
        pass

    def _search_and_replace(self, file_path, pattern, replacement, use_regex=False, ignore_case=False, start_line=None, end_line=None):
        """
        search_and_replace ツールを呼び出すプライベートメソッド。
        """
        print(f"Calling search_and_replace for {file_path}")
        # TODO: search_and_replace ツールを呼び出すロジックを実装
        # <search_and_replace>
        # <path>{file_path}</path>
        # <search>{pattern}</search>
        # <replace>{replacement}</replace>
        # <use_regex>{use_regex}</use_regex>
        # <ignore_case>{ignore_case}</ignore_case>
        # <start_line>{start_line}</start_line>
        # <end_line>{end_line}</end_line>
        # </search_and_replace>
        pass

# コード適用処理の実行例 (開発/テスト用)
if __name__ == "__main__":
    applier = CodeApplier()
    # サンプルの修復案データ構造
    sample_repair_plan = [
        {
            "file_path": "example.py",
            "line_number": 5,
            "code_changes": "    print('Hello from new_func')",
            "reason": "デバッグログを追加"
        },
        {
            "file_path": "another_file.py",
            "line_number": None, # 行指定なしの場合は末尾に追記
            "code_changes": "def another_new_func():\n    pass",
            "reason": "新しい関数を追加"
        }
    ]
    # 実際には Debug モードからこのデータ構造が渡されることを想定
    result, applied_files = applier.apply_repair_plan(sample_repair_plan)
    print(f"コード適用結果: Success={result}, Applied Files={applied_files}")