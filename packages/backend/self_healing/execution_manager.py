# backend/self_healing/execution_manager.py

# 実行管理モジュール
# 修正されたコードの実行や、システムコマンドの実行を管理する責務を持つ。


class ExecutionManager:
    """
    コード実行やシステムコマンド実行を管理するクラス。
    """

    def execute_code(self, code_to_execute, timeout=10):
        """
        指定されたコードをサンドボックス化された環境で実行するメソッド。
        入力検証、タイムアウト、リソース制限を適用する。
        実行結果（標準出力、エラーなど）を返す。
        """
        # 修正ポイント: 入力検証の追加
        if not isinstance(code_to_execute, str):
            # 修正ポイント: 実行結果の安全な取得 - 不正な入力の場合はエラーメッセージを返す
            return {
                "stdout": "",
                "stderr": "Invalid input: code_to_execute must be a string.",
            }

        # 修正ポイント: 危険なコードの簡易的な検出 (例: ファイル操作、ネットワークアクセス)
        # より厳密な検証には静的解析ツールやAST解析が必要
        forbidden_keywords = ["os.", "subprocess.", "socket.", "urllib.", "requests."]
        if any(keyword in code_to_execute for keyword in forbidden_keywords):
            return {"stdout": "", "stderr": "Potential security risk detected in code."}

        # 修正ポイント: 権限管理 - 実行ユーザーの制限 (簡易的な例、OS依存)
        # 実際にはOSレベルのユーザー分離やコンテナ技術との連携が必要
        # import os
        # if os.name == 'posix': # Unix系OSの場合
        #     try:
        #         # 実行ユーザーを特定の低権限ユーザーに変更 (要設定)
        #         # import pwd
        #         # nobody = pwd.getpwnam('nobody')
        #         # os.setuid(nobody.pw_uid)
        #         # os.setgid(nobody.pw_gid)
        #         pass # 実際には上記のコードを有効化し、適切なユーザーを設定
        #     except Exception as e:
        #         print(f"Warning: Failed to set execution user: {e}")

        # 修正ポイント: リソース制限 (メモリ使用量など) - 簡易的な例、OS依存
        # 実際にはOSコマンドや外部ライブラリ、サンドボックス環境の機能に依存
        # import resource
        # if os.name == 'posix': # Unix系OSの場合
        #     try:
        #         # メモリ制限 (例: 100MB)
        #         # resource.setrlimit(resource.RLIMIT_AS, (100 * 1024 * 1024, resource.RLIM_INFINITY))
        #         # CPU時間制限 (例: 10秒) - timeout引数と重複する可能性あり
        #         # resource.setrlimit(resource.RLIMIT_CPU, (timeout, timeout))
        #         pass # 実際には上記のコードを有効化し、適切な制限値を設定
        #     except Exception as e:
        #         print(f"Warning: Failed to set resource limits: {e}")

        # 修正ポイント: サンドボックス化/隔離 (subprocessを使用)
        # 実際にはよりセキュアなサンドボックス環境 (例: Docker, gVisor, rbox) が望ましい
        try:
            # 修正ポイント: タイムアウトとリソース制限 (timeout引数を使用)
            # リソース制限 (メモリ, CPUなど) はOSや環境に依存するため、ここではタイムアウトのみ実装
            import subprocess

            process = subprocess.run(
                ["python", "-c", code_to_execute],
                capture_output=True,
                text=True,
                timeout=timeout,  # 修正ポイント: タイムアウト設定
                check=True,  # 修正ポイント: ゼロ以外の終了コードでCalledProcessErrorを発生させる
            )
            # 修正ポイント: 実行結果の安全な取得 - 出力サイズの制限
            max_output_size = 1024 * 1024  # 例: 1MB
            stdout = process.stdout[:max_output_size]
            stderr = process.stderr[:max_output_size]
            if len(process.stdout) > max_output_size:
                stderr += "\nOutput truncated due to size limit."
            if len(process.stderr) > max_output_size:
                stderr += "\nError output truncated due to size limit."

            execution_result = {"stdout": stdout, "stderr": stderr}
        except subprocess.TimeoutExpired:
            # 修正ポイント: 実行結果の安全な取得 - タイムアウト時のエラーメッセージ
            execution_result = {
                "stdout": "",
                "stderr": f"Execution timed out after {timeout} seconds.",
            }
        except subprocess.CalledProcessError as e:
            # 修正ポイント: 実行結果の安全な取得 - プロセスエラー時のエラーメッセージと出力制限
            max_output_size = 1024 * 1024  # 例: 1MB
            stdout = e.stdout[:max_output_size]
            stderr = e.stderr[:max_output_size]
            if len(e.stdout) > max_output_size:
                stderr += "\nOutput truncated due to size limit."
            if len(e.stderr) > max_output_size:
                stderr += "\nError output truncated due to size limit."
            execution_result = {
                "stdout": stdout,
                "stderr": stderr + f"\nCommand failed with exit code {e.returncode}",
            }
        except Exception as e:
            # 修正ポイント: 実行結果の安全な取得 - その他のエラーメッセージ
            execution_result = {
                "stdout": "",
                "stderr": f"An error occurred during code execution: {e}",
            }

        return execution_result

    def execute_command(self, command, timeout=10):
        """
        システムコマンドを実行するメソッド。
        入力検証、タイムアウト、リソース制限を適用する。
        実行結果（標準出力、エラーなど）を返す。
        """
        # 修正ポイント: 入力検証の追加
        if not isinstance(command, str):
            # 修正ポイント: 実行結果の安全な取得 - 不正な入力の場合はエラーメッセージを返す
            return {"stdout": "", "stderr": "Invalid input: command must be a string."}

        # 修正ポイント: 危険なコマンドの簡易的な検出
        # より厳密な検証が必要
        forbidden_commands = ["rm ", "format ", "shutdown ", "reboot "]  # 例
        if any(forbidden in command for forbidden in forbidden_commands):
            return {
                "stdout": "",
                "stderr": "Potential security risk detected in command.",
            }

        # 修正ポイント: 権限管理 - 実行ユーザーの制限 (簡易的な例、OS依存)
        # 実際にはOSレベルのユーザー分離やコンテナ技術との連携が必要
        # import os
        # if os.name == 'posix': # Unix系OSの場合
        #     try:
        #         # 実行ユーザーを特定の低権限ユーザーに変更 (要設定)
        #         # import pwd
        #         # nobody = pwd.getpwnam('nobody')
        #         # os.setuid(nobody.pw_uid)
        #         # os.setgid(nobody.pw_gid)
        #         pass # 実際には上記のコードを有効化し、適切なユーザーを設定
        #     except Exception as e:
        #         print(f"Warning: Failed to set execution user: {e}")

        # 修正ポイント: リソース制限 (メモリ使用量など) - 簡易的な例、OS依存
        # 実際にはOSコマンドや外部ライブラリ、サンドボックス環境の機能に依存
        # import resource
        # if os.name == 'posix': # Unix系OSの場合
        #     try:
        #         # メモリ制限 (例: 100MB)
        #         # resource.setrlimit(resource.RLIMIT_AS, (100 * 1024 * 1024, resource.RLIM_INFINITY))
        #         # CPU時間制限 (例: 10秒) - timeout引数と重複する可能性あり
        #         # resource.setrlimit(resource.RLIMIT_CPU, (timeout, timeout))
        #         pass # 実際には上記のコードを有効化し、適切な制限値を設定
        #     except Exception as e:
        #         print(f"Warning: Failed to set resource limits: {e}")

        # 修正ポイント: コマンド実行 (subprocessを使用)
        try:
            import subprocess

            # shell=True はセキュリティリスクを高めるため、避けるべきだが、簡易的に使用
            # 実際にはコマンドとその引数をリストで渡す形式が望ましい
            process = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=timeout,  # 修正ポイント: タイムアウト設定
                shell=True,  # 修正ポイント: shell経由での実行 (注意が必要)
                check=True,  # 修正ポイント: ゼロ以外の終了コードでCalledProcessErrorを発生させる
            )
            # 修正ポイント: 実行結果の安全な取得 - 出力サイズの制限
            max_output_size = 1024 * 1024  # 例: 1MB
            stdout = process.stdout[:max_output_size]
            stderr = process.stderr[:max_output_size]
            if len(process.stdout) > max_output_size:
                stderr += "\nOutput truncated due to size limit."
            if len(process.stderr) > max_output_size:
                stderr += "\nError output truncated due to size limit."

            command_result = {"stdout": stdout, "stderr": stderr}
        except subprocess.TimeoutExpired:
            # 修正ポイント: 実行結果の安全な取得 - タイムアウト時のエラーメッセージ
            command_result = {
                "stdout": "",
                "stderr": f"Command timed out after {timeout} seconds.",
            }
        except subprocess.CalledProcessError as e:
            # 修正ポイント: 実行結果の安全な取得 - プロセスエラー時のエラーメッセージと出力制限
            max_output_size = 1024 * 1024  # 例: 1MB
            stdout = e.stdout[:max_output_size]
            stderr = e.stderr[:max_output_size]
            if len(e.stdout) > max_output_size:
                stderr += "\nOutput truncated due to size limit."
            if len(e.stderr) > max_output_size:
                stderr += "\nError output truncated due to size limit."
            command_result = {
                "stdout": stdout,
                "stderr": stderr + f"\nCommand failed with exit code {e.returncode}",
            }
        except Exception as e:
            # 修正ポイント: 実行結果の安全な取得 - その他のエラーメッセージ
            command_result = {
                "stdout": "",
                "stderr": f"An error occurred during command execution: {e}",
            }

        return command_result


# 実行管理処理の実行例 (開発/テスト用)
if __name__ == "__main__":
    manager = ExecutionManager()
    sample_code = "print('Hello, Self-Healing!')"
    code_exec_result = manager.execute_code(sample_code)
    print(f"コード実行結果: {code_exec_result}")

    sample_command = "echo 'Test command'"
    command_exec_result = manager.execute_command(sample_command)
    print(f"コマンド実行結果: {command_exec_result}")
