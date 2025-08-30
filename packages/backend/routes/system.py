import logging
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.system import SelfHealingHistory

router = APIRouter(prefix="/api/v1/self-healing")
logger = logging.getLogger(__name__)


@router.get("/history", response_model=List[SelfHealingHistory])
async def get_repair_history(db: Session = Depends(get_db)):
    """自律修復履歴を取得"""
    try:
        history = (
            db.query(SelfHealingHistory)
            .order_by(SelfHealingHistory.created_at.desc())
            .limit(50)
            .all()
        )
        return history
    except Exception as e:
        logger.error(f"修復履歴取得エラー: {str(e)}")
        raise HTTPException(status_code=500, detail="修復履歴の取得に失敗しました")


@router.post("/trigger")
async def trigger_repair_process(context: dict, db: Session = Depends(get_db)):
    """手動で修復プロセスをトリガー"""
    try:
        # 修復プロセスを開始
        new_record = SelfHealingHistory(
            system_name="manual_trigger",
            repair_status="pending",
            execution_context=context,
        )
        db.add(new_record)
        db.commit()

        # TODO: 実際の修復プロセスを呼び出す
        # repair_service.execute(context)

        return JSONResponse(
            status_code=202,
            content={
                "message": "修復プロセスを開始しました",
                "repair_id": new_record.id,
            },
        )
    except Exception as e:
        logger.error(f"修復プロセス開始エラー: {str(e)}")
        raise HTTPException(status_code=500, detail="修復プロセスの開始に失敗しました")
