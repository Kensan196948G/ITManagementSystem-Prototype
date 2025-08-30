# backend/self_healing/logger.py

import json
import os
from datetime import datetime

LOG_DIR = "FixLogs"  # Architectモードの設計に基づき FixLogs を使用
ERROR_FIX_LOG_FILE = os.path.join(LOG_DIR, "repair_log.jsonl")  # JSON Lines形式を提案


def log_repair_event(event_type, data):
    """
    自律型エラー修復ループのイベントをログファイルに記録する。

    Args:
        event_type (str): イベントの種類 (例: "ERROR_DETECTED", "ANALYSIS_RESULT")
        data (dict): 記録するデータ
    """
    # ログディレクトリが存在しない場合は作成
    if not os.path.exists(LOG_DIR):
        os.makedirs(LOG_DIR)

    timestamp = datetime.now().isoformat()
    log_entry = {"timestamp": timestamp, "event_type": event_type, "data": data}

    # JSON Lines形式でファイルに追記
    try:
        with open(ERROR_FIX_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
        print(f"Logged event: {event_type}")
    except Exception as e:
        print(f"Error writing to log file {ERROR_FIX_LOG_FILE}: {e}")


# TODO: History ログの記録機能も必要に応じて追加
# HISTORY_LOG_DIR = os.path.join("Logs", "History")
# def log_history_event(...):
#     pass
