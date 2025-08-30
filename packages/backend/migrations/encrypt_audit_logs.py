"""
監査ログ暗号化マイグレーションスクリプト

既存のSecurityEventレコードを暗号化し、新しいカラムにデータを移行します。
"""

import asyncio
from datetime import datetime

from backend.models import SecurityEvent, db


async def migrate_security_events():
    """SecurityEventテーブルの既存データを暗号化"""
    print(f"[{datetime.utcnow()}] 監査ログ暗号化マイグレーション開始")

    total = await SecurityEvent.query.count()
    print(f"暗号化対象レコード数: {total}件")

    processed = 0
    batch_size = 100  # パフォーマンスとメモリ使用量のバランス

    while True:
        events = await SecurityEvent.query.limit(batch_size).offset(processed).all()
        if not events:
            break

        for event in events:
            try:
                # 既に暗号化済みかチェック
                if not any(
                    [
                        event.description_encrypted,
                        event.ip_address_encrypted,
                        event.location_encrypted,
                        event.action_taken_encrypted,
                    ]
                ):
                    await event.encrypt_sensitive_fields()
                    await db.session.commit()

            except Exception as e:
                print(f"レコードID {event.id} の暗号化に失敗: {str(e)}")
                await db.session.rollback()

        processed += len(events)
        print(f"進捗: {processed}/{total} ({processed/total*100:.1f}%)")

    print(f"[{datetime.utcnow()}] 監査ログ暗号化マイグレーション完了")


if __name__ == "__main__":
    asyncio.run(migrate_security_events())
