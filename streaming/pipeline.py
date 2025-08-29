import os
import sys
from pathlib import Path

# モジュール探索パスを追加 (環境変数と絶対パスを使用)
project_root = Path(os.getenv('PROJECT_ROOT', Path(__file__).parent.parent))
required_paths = [
    str(project_root),
    str(project_root / "backend"),
    str(project_root / "backend" / "utils"),
    str(project_root / "streaming"),
    str(project_root / "features")
]

# 重複を避けてパスを追加
for path in required_paths:
    if path not in sys.path:
        sys.path.append(path)

# モジュール探索パスをログ出力 (デバッグ用)
if os.getenv('DEBUG_MODULE_PATHS', 'false').lower() == 'true':
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    logger.info("Module search paths: %s", sys.path)

from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.connectors import FlinkKafkaConsumer
from pyflink.datastream.formats import JsonRowDeserializationSchema
from pyflink.common.serialization import SimpleStringSchema
from pyflink.common.typeinfo import Types
from pyflink.datastream.window import Time
from pyflink.common.watermark import WatermarkStrategy
from pyflink.common.time import Duration
from pyflink.datastream.functions import SerializableTimestampAssigner
try:
    from utils.metrics import PrometheusSink
    from features.engine import FeatureEngine
except ImportError as e:
    import logging
    import traceback
    logging.basicConfig(level=logging.ERROR)
    logger = logging.getLogger(__name__)
    logger.error("Module import failed: %s", str(e))
    logger.error("Traceback: %s", traceback.format_exc())
    logger.error("Current sys.path: %s", sys.path)
    logger.error("Project root: %s", project_root)
    logger.error("Required paths: %s", required_paths)
    raise
import redis

class AuditLogPipeline:
    def __init__(self):
        self.env = StreamExecutionEnvironment.get_execution_environment()
        self.env.set_parallelism(3)  # 並列処理でスループット向上
        
        # Kafkaソース設定
        self.kafka_source = FlinkKafkaConsumer(
            topics='audit_logs',
            deserialization_schema=JsonRowDeserializationSchema.builder()
                .type_info(Types.MAP(Types.STRING(), Types.STRING()))
                .build(),
            properties={
                'bootstrap.servers': 'kafka:9092',
                'group.id': 'flink_consumer'
            }
        )
        
        # Redis接続プール設定 (環境変数から取得、デフォルトは30秒)
        redis_timeout = int(os.getenv('REDIS_TIMEOUT', '30'))
        redis_max_connections = int(os.getenv('REDIS_MAX_CONNECTIONS', '100'))
        self.redis_pool = redis.ConnectionPool(
            host=os.getenv('REDIS_HOST', 'redis'),
            port=int(os.getenv('REDIS_PORT', '6379')),
            db=int(os.getenv('REDIS_DB', '0')),
            socket_timeout=redis_timeout,
            socket_connect_timeout=redis_timeout,
            retry_on_timeout=True,
            max_connections=redis_max_connections,
            password=os.getenv('REDIS_PASSWORD'),
            health_check_interval=30  # 30秒ごとに接続チェック
        )

    def process_stream(self):
        # ソースからデータストリームを取得
        stream = self.env.add_source(self.kafka_source)
        
        # イベント時間とウォーターマークの設定
        timed_stream = stream.assign_timestamps_and_watermarks(
            WatermarkStrategy.for_bounded_out_of_orderness(Duration.of_seconds(5))
                .with_timestamp_assigner(
                    SerializableTimestampAssigner(
                        lambda event: int(event['timestamp']) * 1000  # UNIXタイムスタンプをミリ秒に変換
                    )
                )
        )
        
        # 5秒間隔のスライディングウィンドウで処理
        windowed_stream = timed_stream.key_by(lambda x: x['user_id']) \
            .window(Time.seconds(5)) \
            .process(FeatureEngine(self.redis_pool))
        
        # Prometheusメトリクス出力
        windowed_stream.add_sink(
            PrometheusSink(
                host='prometheus',
                port=9090,
                job_name='flink_metrics',
                additional_labels={'application': 'audit_log_processor'}
            )
        )
        
        return self.env.execute("AuditLogProcessing")

if __name__ == "__main__":
    pipeline = AuditLogPipeline()
    pipeline.process_stream()