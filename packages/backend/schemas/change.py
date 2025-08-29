"""
変更要求関連のPydanticスキーマ
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ChangeStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"
    IMPLEMENTATION = "implementation"
    REVIEW = "review"
    COMPLETE = "complete"
    CANCELLED = "cancelled"

class ChangePriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ChangeRisk(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class ChangeBase(BaseModel):
    title: str
    description: str
    justification: Optional[str] = None
    priority: ChangePriority = ChangePriority.MEDIUM
    risk_level: ChangeRisk = ChangeRisk.MEDIUM
    category: Optional[str] = None
    impact: Optional[str] = None
    implementation_plan: Optional[str] = None
    rollback_plan: Optional[str] = None
    testing_plan: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None

class ChangeCreate(ChangeBase):
    requester_id: int
    assignee_id: Optional[int] = None

class ChangeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    justification: Optional[str] = None
    priority: Optional[ChangePriority] = None
    risk_level: Optional[ChangeRisk] = None
    category: Optional[str] = None
    impact: Optional[str] = None
    implementation_plan: Optional[str] = None
    rollback_plan: Optional[str] = None
    testing_plan: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    status: Optional[ChangeStatus] = None
    assignee_id: Optional[int] = None

class ChangeInDB(ChangeBase):
    id: int
    change_id: str
    status: ChangeStatus
    requester_id: int
    assignee_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class Change(ChangeInDB):
    requester: Optional[dict] = None
    assignee: Optional[dict] = None

class ChangeList(BaseModel):
    items: List[Change]
    total: int
    page: int
    size: int
    pages: int