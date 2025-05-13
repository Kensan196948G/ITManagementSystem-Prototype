from fastapi import FastAPI, Depends, APIRouter
from backend.dependencies import get_current_user
from backend.self_healing import engine as self_healing_engine

app = FastAPI()

# 既存のルーター設定 (省略)

# 自律修復モジュール統合
self_healing_router = APIRouter(
    prefix="/api/v1/self-healing",
    tags=["Self Healing"],
    dependencies=[Depends(get_current_user)]  # JWT認証を継承
)

@self_healing_router.post("/trigger")
async def trigger_repair(context: dict):
    """自律修復プロセスを開始するエンドポイント"""
    repair_engine = self_healing_engine.AutoRepairEngine(max_retries=5)
    return await repair_engine.execute_with_repair(
        target_system="production",
        context=context
    )

@self_healing_router.get("/history")
async def get_repair_history(limit: int = 100):
    """修復履歴を取得するエンドポイント"""
    return {"history": []}  # TODO: データベース連携

app.include_router(self_healing_router)
