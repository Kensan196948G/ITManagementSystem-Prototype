-- 既存のスキーマ定義 (省略)

-- 自律修復モジュール用テーブル追加
CREATE TABLE self_healing_history (
    id SERIAL PRIMARY KEY,
    system_name VARCHAR(255) NOT NULL,
    repair_status VARCHAR(50) NOT NULL,
    execution_context JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (repair_status IN ('pending', 'success', 'failed', 'retrying'))
);

-- インデックス追加
CREATE INDEX idx_self_healing_system ON self_healing_history(system_name);
CREATE INDEX idx_self_healing_status ON self_healing_history(repair_status);