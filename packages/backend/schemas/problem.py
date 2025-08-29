"""
問題関連のPydanticスキーマ
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ProblemPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ProblemStatus(str, Enum):
    NEW = "new"
    INVESTIGATING = "investigating"
    KNOWN_ERROR = "known_error"
    RESOLVED = "resolved"
    CLOSED = "closed"

class ProblemBase(BaseModel):
    title: str = Field(..., example="Database performance issue")
    description: Optional[str] = Field(None, example="Description of the problem")
    priority: ProblemPriority = ProblemPriority.MEDIUM
    status: ProblemStatus = ProblemStatus.NEW
    category: Optional[str] = None
    impact: Optional[str] = None
    root_cause: Optional[str] = None
    workaround: Optional[str] = None

class ProblemCreate(ProblemBase):
    reporter_id: int
    assignee_id: Optional[int] = None

class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[ProblemPriority] = None
    status: Optional[ProblemStatus] = None
    category: Optional[str] = None
    impact: Optional[str] = None
    root_cause: Optional[str] = None
    workaround: Optional[str] = None
    assignee_id: Optional[int] = None
    solution: Optional[str] = None

class ProblemInDB(ProblemBase):
    id: int
    problem_id: str
    reporter_id: int
    assignee_id: Optional[int] = None
    solution: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class Problem(ProblemInDB):
    reporter: Optional[dict] = None
    assignee: Optional[dict] = None

class ProblemList(BaseModel):
    items: List[Problem]
    total: int
    page: int
    size: int
    pages: int