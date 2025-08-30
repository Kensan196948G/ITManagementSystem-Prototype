#!/usr/bin/env python3
"""
ITサービス管理システム - キーローテーション管理
ISO 27002: 10.1.2 鍵管理 準拠

機能:
- JWT秘密鍵の自動ローテーション
- セッション鍵の更新
- 暗号化キーの世代管理
- 安全なキー保管とバックアップ
- キーローテーションスケジューリング

使用方法:
    python scripts/key_rotation.py --rotate jwt
    python scripts/key_rotation.py --rotate all
    python scripts/key_rotation.py --schedule
    python scripts/key_rotation.py --verify
"""

import argparse
import base64
import hashlib
import json
import logging
import os
import secrets
import shutil
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

# ログ設定
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("KeyRotationManager")


class KeyRotationManager:
    """キーローテーション管理クラス"""

    def __init__(self, project_root: str = None):
        self.project_root = (
            Path(project_root) if project_root else Path(__file__).parent.parent
        )
        self.env_file = self.project_root / ".env"
        self.backup_dir = self.project_root / "backups" / "keys"
        self.key_store_file = self.project_root / ".key_store.json"

        # 暗号化されたキーストレージ
        self.backup_dir.mkdir(parents=True, exist_ok=True)

        # キーローテーション設定
        self.rotation_config = {
            "jwt_secret": {
                "rotation_days": 90,
                "backup_versions": 5,
                "key_length": 64,
                "encoding": "base64",
            },
            "session_secret": {
                "rotation_days": 30,
                "backup_versions": 3,
                "key_length": 32,
                "encoding": "base64",
            },
            "csrf_secret": {
                "rotation_days": 30,
                "backup_versions": 3,
                "key_length": 32,
                "encoding": "base64",
            },
            "encryption_key": {
                "rotation_days": 180,
                "backup_versions": 10,
                "key_length": 32,
                "encoding": "base64",
            },
        }

    def generate_secure_key(self, length: int = 32, encoding: str = "base64") -> str:
        """セキュアなキーを生成"""
        random_bytes = secrets.token_bytes(length)

        if encoding == "base64":
            return base64.b64encode(random_bytes).decode("utf-8")
        elif encoding == "hex":
            return random_bytes.hex()
        elif encoding == "urlsafe":
            return secrets.token_urlsafe(length)
        else:
            return base64.b64encode(random_bytes).decode("utf-8")

    def load_key_history(self) -> Dict:
        """キー履歴を読み込み"""
        if self.key_store_file.exists():
            try:
                with open(self.key_store_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"キー履歴の読み込みに失敗: {e}")

        return {"keys": {}, "rotation_history": []}

    def save_key_history(self, key_history: Dict):
        """キー履歴を保存"""
        try:
            with open(self.key_store_file, "w", encoding="utf-8") as f:
                json.dump(key_history, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"キー履歴の保存に失敗: {e}")

    def backup_current_keys(self) -> str:
        """現在のキーをバックアップ"""
        if not self.env_file.exists():
            raise FileNotFoundError(f".env ファイルが見つかりません: {self.env_file}")

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = self.backup_dir / f"keys_backup_{timestamp}.env"

        # .envファイルをバックアップ
        shutil.copy2(self.env_file, backup_file)

        # バックアップファイルを暗号化
        encrypted_backup = self._encrypt_backup_file(backup_file)

        logger.info(f"キーバックアップを作成しました: {backup_file}")
        return str(backup_file)

    def _encrypt_backup_file(self, backup_file: Path) -> Path:
        """バックアップファイルを暗号化"""
        try:
            # マスターパスワードから暗号化キーを派生
            master_password = os.environ.get(
                "BACKUP_MASTER_PASSWORD", "default_backup_key"
            ).encode()
            salt = secrets.token_bytes(16)
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(master_password))
            cipher = Fernet(key)

            # ファイルを暗号化
            with open(backup_file, "rb") as f:
                plaintext = f.read()

            encrypted_data = {
                "salt": base64.b64encode(salt).decode(),
                "data": cipher.encrypt(plaintext).decode(),
            }

            encrypted_file = backup_file.with_suffix(".enc")
            with open(encrypted_file, "w", encoding="utf-8") as f:
                json.dump(encrypted_data, f)

            # 元のファイルを削除
            backup_file.unlink()

            return encrypted_file

        except Exception as e:
            logger.warning(f"バックアップファイルの暗号化に失敗: {e}")
            return backup_file

    def rotate_key(self, key_type: str) -> Dict[str, str]:
        """指定されたキーをローテーション"""
        if key_type not in self.rotation_config:
            raise ValueError(f"未知のキータイプ: {key_type}")

        config = self.rotation_config[key_type]

        # 現在のキーを取得
        current_key = self._get_current_key(key_type)

        # 新しいキーを生成
        new_key = self.generate_secure_key(
            length=config["key_length"], encoding=config["encoding"]
        )

        # キー履歴を更新
        key_history = self.load_key_history()

        if key_type not in key_history["keys"]:
            key_history["keys"][key_type] = []

        # 現在のキーを履歴に追加
        if current_key:
            key_entry = {
                "key_hash": hashlib.sha256(current_key.encode()).hexdigest()[:16],
                "rotation_date": datetime.now().isoformat(),
                "status": "rotated",
            }
            key_history["keys"][key_type].append(key_entry)

        # 古いキーを削除（保持数を超えた場合）
        if len(key_history["keys"][key_type]) > config["backup_versions"]:
            removed_keys = key_history["keys"][key_type][: -config["backup_versions"]]
            key_history["keys"][key_type] = key_history["keys"][key_type][
                -config["backup_versions"] :
            ]

            for removed_key in removed_keys:
                removed_key["status"] = "expired"

        # ローテーション履歴を追加
        rotation_entry = {
            "key_type": key_type,
            "rotation_date": datetime.now().isoformat(),
            "old_key_hash": (
                hashlib.sha256(current_key.encode()).hexdigest()[:16]
                if current_key
                else None
            ),
            "new_key_hash": hashlib.sha256(new_key.encode()).hexdigest()[:16],
            "reason": "scheduled_rotation",
        }
        key_history["rotation_history"].append(rotation_entry)

        # キー履歴を保存
        self.save_key_history(key_history)

        logger.info(f"{key_type} キーをローテーションしました")

        return {
            "key_type": key_type,
            "old_key": current_key,
            "new_key": new_key,
            "rotation_date": datetime.now().isoformat(),
        }

    def rotate_all_keys(self) -> List[Dict[str, str]]:
        """全キーをローテーション"""
        results = []

        # 現在のキーをバックアップ
        backup_file = self.backup_current_keys()

        for key_type in self.rotation_config.keys():
            try:
                result = self.rotate_key(key_type)
                results.append(result)
            except Exception as e:
                logger.error(f"{key_type} キーのローテーションに失敗: {e}")
                results.append(
                    {"key_type": key_type, "error": str(e), "status": "failed"}
                )

        return results

    def check_rotation_schedule(self) -> List[Dict]:
        """ローテーションスケジュールをチェック"""
        key_history = self.load_key_history()
        rotation_needed = []

        for key_type, config in self.rotation_config.items():
            # 最後のローテーション日を取得
            last_rotation = None
            for entry in reversed(key_history["rotation_history"]):
                if entry["key_type"] == key_type:
                    last_rotation = datetime.fromisoformat(entry["rotation_date"])
                    break

            # ローテーションが必要かチェック
            if last_rotation is None:
                # 初回ローテーション
                rotation_needed.append(
                    {
                        "key_type": key_type,
                        "reason": "initial_setup",
                        "priority": "high",
                        "days_overdue": None,
                    }
                )
            else:
                next_rotation = last_rotation + timedelta(days=config["rotation_days"])
                if datetime.now() >= next_rotation:
                    days_overdue = (datetime.now() - next_rotation).days
                    priority = (
                        "critical"
                        if days_overdue > 30
                        else "high" if days_overdue > 7 else "medium"
                    )

                    rotation_needed.append(
                        {
                            "key_type": key_type,
                            "reason": "scheduled",
                            "priority": priority,
                            "days_overdue": days_overdue,
                            "last_rotation": last_rotation.isoformat(),
                            "next_rotation": next_rotation.isoformat(),
                        }
                    )

        return rotation_needed

    def verify_key_integrity(self) -> Dict[str, bool]:
        """キーの整合性を検証"""
        integrity_status = {}

        for key_type in self.rotation_config.keys():
            try:
                current_key = self._get_current_key(key_type)

                if not current_key:
                    integrity_status[key_type] = False
                    continue

                # キーの長さチェック
                config = self.rotation_config[key_type]
                if config["encoding"] == "base64":
                    try:
                        decoded = base64.b64decode(current_key)
                        key_valid = len(decoded) >= config["key_length"] // 2
                    except:
                        key_valid = False
                else:
                    key_valid = len(current_key) >= config["key_length"]

                integrity_status[key_type] = key_valid

            except Exception as e:
                logger.error(f"{key_type} の整合性検証に失敗: {e}")
                integrity_status[key_type] = False

        return integrity_status

    def update_env_file(self, key_updates: List[Dict[str, str]]):
        """環境変数ファイルを更新"""
        if not self.env_file.exists():
            logger.warning(".env ファイルが存在しません")
            return

        try:
            # .envファイルを読み込み
            with open(self.env_file, "r", encoding="utf-8") as f:
                lines = f.readlines()

            # キーを更新
            for update in key_updates:
                key_type = update["key_type"]
                new_key = update["new_key"]

                env_var_name = self._get_env_var_name(key_type)
                updated = False

                for i, line in enumerate(lines):
                    if line.strip().startswith(f"{env_var_name}="):
                        lines[i] = f"{env_var_name}={new_key}\n"
                        updated = True
                        break

                if not updated:
                    # 環境変数が存在しない場合は追加
                    lines.append(f"{env_var_name}={new_key}\n")

            # ファイルに書き込み
            with open(self.env_file, "w", encoding="utf-8") as f:
                f.writelines(lines)

            logger.info("環境変数ファイルを更新しました")

        except Exception as e:
            logger.error(f"環境変数ファイルの更新に失敗: {e}")

    def _get_current_key(self, key_type: str) -> Optional[str]:
        """現在のキーを取得"""
        env_var_name = self._get_env_var_name(key_type)

        if self.env_file.exists():
            try:
                with open(self.env_file, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.strip().startswith(f"{env_var_name}="):
                            return line.split("=", 1)[1].strip().strip("\"'")
            except Exception as e:
                logger.error(f"キー取得に失敗: {e}")

        # 環境変数からも確認
        return os.environ.get(env_var_name)

    def _get_env_var_name(self, key_type: str) -> str:
        """キータイプから環境変数名を取得"""
        mapping = {
            "jwt_secret": "JWT_SECRET",
            "session_secret": "SESSION_SECRET",
            "csrf_secret": "CSRF_SECRET",
            "encryption_key": "ENCRYPTION_KEY",
        }
        return mapping.get(key_type, key_type.upper())

    def generate_rotation_report(self) -> Dict:
        """ローテーションレポートを生成"""
        key_history = self.load_key_history()
        rotation_schedule = self.check_rotation_schedule()
        integrity_status = self.verify_key_integrity()

        report = {
            "timestamp": datetime.now().isoformat(),
            "key_status": {
                "total_keys": len(self.rotation_config),
                "keys_needing_rotation": len(rotation_schedule),
                "integrity_status": integrity_status,
            },
            "rotation_schedule": rotation_schedule,
            "rotation_history": key_history.get("rotation_history", [])[
                -10:
            ],  # 最新10件
            "recommendations": [],
        }

        # 推奨事項を生成
        for schedule_item in rotation_schedule:
            if schedule_item["priority"] == "critical":
                report["recommendations"].append(
                    f"🔴 {schedule_item['key_type']} キーを直ちにローテーションしてください (期限超過: {schedule_item['days_overdue']}日)"
                )
            elif schedule_item["priority"] == "high":
                report["recommendations"].append(
                    f"🟠 {schedule_item['key_type']} キーのローテーションが必要です"
                )

        for key_type, is_valid in integrity_status.items():
            if not is_valid:
                report["recommendations"].append(
                    f"⚠️ {key_type} キーの整合性に問題があります"
                )

        return report


def main():
    parser = argparse.ArgumentParser(
        description="ITサービス管理システム キーローテーション管理"
    )
    parser.add_argument(
        "--rotate",
        choices=["jwt", "session", "csrf", "encryption", "all"],
        help="ローテーションするキータイプ",
    )
    parser.add_argument(
        "--schedule", action="store_true", help="ローテーションスケジュールをチェック"
    )
    parser.add_argument("--verify", action="store_true", help="キーの整合性を検証")
    parser.add_argument(
        "--report", action="store_true", help="ローテーションレポートを表示"
    )
    parser.add_argument(
        "--update-env", action="store_true", help="環境変数ファイルを自動更新"
    )
    parser.add_argument("--project-root", help="プロジェクトルートパス")

    args = parser.parse_args()

    if not any([args.rotate, args.schedule, args.verify, args.report]):
        parser.print_help()
        sys.exit(1)

    manager = KeyRotationManager(args.project_root)

    try:
        if args.rotate:
            if args.rotate == "all":
                results = manager.rotate_all_keys()
                print("全キーローテーション結果:")
                for result in results:
                    if "error" in result:
                        print(f"  ❌ {result['key_type']}: {result['error']}")
                    else:
                        print(f"  ✅ {result['key_type']}: ローテーション完了")

                # 環境変数ファイルを更新
                if args.update_env:
                    successful_results = [r for r in results if "error" not in r]
                    manager.update_env_file(successful_results)
            else:
                key_type_map = {
                    "jwt": "jwt_secret",
                    "session": "session_secret",
                    "csrf": "csrf_secret",
                    "encryption": "encryption_key",
                }
                key_type = key_type_map.get(args.rotate, args.rotate)

                result = manager.rotate_key(key_type)
                print(f"{key_type} キーローテーション完了:")
                print(f"  新しいキー: {result['new_key']}")

                # 環境変数ファイルを更新
                if args.update_env:
                    manager.update_env_file([result])

        if args.schedule:
            schedule = manager.check_rotation_schedule()
            print("\nキーローテーションスケジュール:")
            if schedule:
                for item in schedule:
                    priority_icon = {
                        "critical": "🔴",
                        "high": "🟠",
                        "medium": "🟡",
                    }.get(item["priority"], "⚪")
                    print(f"  {priority_icon} {item['key_type']}: {item['reason']}")
                    if item["days_overdue"]:
                        print(f"    期限超過: {item['days_overdue']}日")
            else:
                print("  ✅ 全キーが最新です")

        if args.verify:
            integrity = manager.verify_key_integrity()
            print("\nキー整合性検証:")
            for key_type, is_valid in integrity.items():
                status_icon = "✅" if is_valid else "❌"
                print(
                    f"  {status_icon} {key_type}: {'正常' if is_valid else '問題あり'}"
                )

        if args.report:
            report = manager.generate_rotation_report()
            print("\n" + "=" * 60)
            print("    キーローテーション管理レポート")
            print("=" * 60)
            print(f"生成日時: {report['timestamp']}")
            print(f"管理キー数: {report['key_status']['total_keys']}")
            print(
                f"ローテーション必要: {report['key_status']['keys_needing_rotation']}"
            )

            if report["recommendations"]:
                print("\n推奨事項:")
                for recommendation in report["recommendations"]:
                    print(f"  {recommendation}")

            print("\n最近のローテーション履歴:")
            for history in report["rotation_history"]:
                print(f"  {history['rotation_date'][:10]} - {history['key_type']}")

    except Exception as e:
        logger.error(f"キーローテーション処理でエラーが発生: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
