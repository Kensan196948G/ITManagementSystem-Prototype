import asyncio
import json
import logging
import os
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from functools import wraps
from typing import Any, Dict, List, Optional, Protocol, Tuple, runtime_checkable

import aioredis
import numpy as np  # 明示的インポート追加
from dotenv import (
    load_dotenv,
)  # 修正ポイント: 環境変数を読み込むためのライブラリをインポート
from prometheus_client import Counter, Gauge, Histogram, start_http_server

load_dotenv()  # 修正ポイント: .envファイルを読み込む

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        # 修正ポイント: ログファイルパスを環境変数から読み込むように変更
        logging.FileHandler(os.getenv("LOG_FILE_PATH", "FixLogs/feature_engine.log")),
    ],
)

# Prometheusメトリクス定義
LOGIN_ATTEMPTS = Counter(
    "user_login_attempts_total", "Total login attempts per user", ["user_id"]
)
ABNORMAL_REQUESTS = Counter(
    "ip_abnormal_requests_total", "Abnormal requests frequency per IP", ["ip_address"]
)
SESSION_DURATION = Histogram(
    "session_duration_seconds",
    "Session duration statistics",
    buckets=[0.1, 0.5, 1, 5, 10, 30, 60],
)
REDIS_OPS = Counter("redis_operations_total", "Total Redis operations", ["operation"])
RETRY_ATTEMPTS = Counter(
    "operation_retry_attempts_total", "Total retry attempts", ["operation"]
)
BATCH_WRITE_SIZE = Gauge("redis_batch_write_size", "Size of Redis batch writes")
REDIS_WRITE_TIME = Histogram(
    "redis_write_time_seconds",
    "Redis write operation duration",
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
)
REDIS_ERRORS = Counter(
    "redis_errors_total", "Total Redis operation errors", ["operation"]
)


@runtime_checkable
class WindowProcessor(Protocol):
    """ウィンドウ処理インターフェース"""

    async def process(self, event: Dict[str, Any]) -> None:
        """イベント処理メソッド"""
        ...

    async def flush(self) -> None:
        """バッファの内容をフラッシュ"""
        ...


@dataclass
class WindowConfig:
    """ウィンドウ処理設定"""

    window_size: int = 5
    batch_size: int = 100
    max_retries: int = 3
    retry_delay: float = 0.1


class ProcessWindowFunction(WindowProcessor):
    """完全実装されたウィンドウ処理関数"""

    def __init__(self, config: WindowConfig):
        self.config = config
        self.buffer: List[Dict[str, Any]] = []
        self.last_flush_time: float = time.time()

    async def process(self, event: Dict[str, Any]) -> None:
        """イベントを処理"""
        self.buffer.append(event)

        if (
            len(self.buffer) >= self.config.batch_size
            or time.time() - self.last_flush_time >= self.config.window_size
        ):
            await self.flush()

    async def flush(self) -> None:
        """バッファの内容をフラッシュ"""
        if not self.buffer:
            return

        try:
            processed = len(self.buffer)
            self.buffer.clear()
            self.last_flush_time = time.time()
            logging.info(f"Processed batch of {processed} events")
        except Exception as e:
            logging.error(f"Batch processing failed: {e}")
            raise


def retry_mechanism(max_retries: int = 3, delay: float = 0.1):
    """リトライデコレータ"""

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_error = e
                    RETRY_ATTEMPTS.labels(operation=func.__name__).inc()
                    if attempt < max_retries - 1:
                        await asyncio.sleep(delay * (attempt + 1))
            raise last_error

        return wrapper

    return decorator


class HybridWindowFunction(WindowProcessor):
    """ハイブリッドウィンドウ処理機能"""

    def __init__(self, config: WindowConfig):
        self.config = config
        self.buffer: List[Dict[str, Any]] = []
        self.last_flush_time: float = time.time()

    async def process(self, event: Dict[str, Any]) -> None:
        """イベントを処理"""
        self.buffer.append(event)

        if (
            len(self.buffer) >= self.config.batch_size
            or time.time() - self.last_flush_time >= self.config.window_size
        ):
            await self.flush()

    @retry_mechanism(max_retries=3, delay=0.1)
    async def flush(self) -> None:
        """バッファの内容をフラッシュ"""
        if not self.buffer:
            return

        BATCH_WRITE_SIZE.set(len(self.buffer))

        try:
            processed = len(self.buffer)
            self.buffer.clear()
            self.last_flush_time = time.time()
            logging.info(f"Processed batch of {processed} events")
        except Exception as e:
            logging.error(f"Batch processing failed: {e}")
            raise


class FeatureEngine:
    """特徴量計算エンジン (ハイブリッドアーキテクチャ版)"""

    # 修正ポイント: Redis接続URLを環境変数から読み込むように変更
    def __init__(
        self,
        redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379"),
        config: Optional[WindowConfig] = None,
    ):
        """エンジン初期化

        Args:
            redis_url: Redis接続URL
            config: ウィンドウ処理設定
        """
        self.redis_url = redis_url
        self.config = config or WindowConfig()
        self.redis_pool: Optional[aioredis.Redis] = None
        self.window_processor: WindowProcessor = HybridWindowFunction(self.config)

        # Prometheusメトリクスサーバー起動
        start_http_server(8000)

    async def initialize(self) -> None:
        """Redis接続プールを初期化"""
        self.redis_pool = await aioredis.from_url(
            self.redis_url, max_connections=10, decode_responses=True
        )

    async def close(self) -> None:
        """リソースの解放"""
        if self.redis_pool:
            await self.redis_pool.close()

    async def process_event(self, event: Dict[str, Any]) -> None:
        """監査ログイベントを処理

        Args:
            event: 監査ログイベントデータ
        """
        try:
            await self.window_processor.process(event)
            await self._calculate_features(event)
        except Exception as e:
            logging.error(f"Error processing event: {e}")
            raise

    async def _calculate_features(self, event: Dict[str, Any]) -> None:
        """特徴量を計算"""
        current_time = time.time()

        if event.get("event_type") == "login_attempt":
            user_id = event["user_id"]
            LOGIN_ATTEMPTS.labels(user_id=user_id).inc()

        if event.get("severity") == "high":
            ip = event["source_ip"]
            ABNORMAL_REQUESTS.labels(ip_address=ip).inc()

        if event.get("event_type") == "session_end":
            duration = event["duration_seconds"]
            SESSION_DURATION.observe(duration)

    @retry_mechanism(max_retries=3, delay=0.1)
    async def _store_features_in_redis(self, features: Dict[str, Any]) -> None:
        """特徴量をRedisにバッチ書き込み

        Args:
            features: 特徴量辞書 {feature_key: feature_value}
        """
        if not self.redis_pool:
            raise ValueError("Redis connection pool not initialized")

        start_time = time.time()
        try:
            async with self.redis_pool.pipeline(transaction=False) as pipe:
                for key, value in features.items():
                    pipe.setex(key, 300, str(value))
                    REDIS_OPS.labels(operation="set").inc()

                BATCH_WRITE_SIZE.set(len(features))

                results = await pipe.execute()

                successful_ops = len([r for r in results if r])
                logging.debug(
                    f"Redis batch write: {successful_ops}/{len(features)} successful"
                )

                REDIS_WRITE_TIME.observe(time.time() - start_time)

                return successful_ops

        except aioredis.RedisError as e:
            logging.error(f"Redis batch write failed: {e}")
            REDIS_ERRORS.labels(operation="batch_write").inc()
            raise

    @REDIS_WRITE_TIME.time()
    async def _async_write_to_redis(self, user_id, features):
        """Redisへの非同期書き込み"""
        try:
            redis = await self._get_redis()
            await redis.setex(f"user_features:{user_id}", 300, json.dumps(features))
        except Exception as e:
            logging.error(f"Redis書き込みエラー: {str(e)}", exc_info=True)

    async def get_feature(self, feature_name: str, key: str) -> Optional[float]:
        """Redisから特徴量を取得

        Args:
            feature_name: 特徴量名
            key: ユーザーID/IPアドレスなど

        Returns:
            特徴量値 or None
        """
        if not self.redis_pool:
            return None

        try:
            value = await self.redis_pool.get(f"feature:{feature_name}:{key}")
            REDIS_OPS.labels(operation="get").inc()
            return float(value) if value else None
        except (ValueError, TypeError) as e:
            logging.error(f"Feature value conversion error: {e}")
            return None

    def clear(self, context):
        """状態管理のクリア処理実装"""
        pass
