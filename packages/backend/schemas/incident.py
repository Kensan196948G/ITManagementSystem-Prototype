"""
インシデント関連のPydanticスキーマ
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class IncidentSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class IncidentStatus(str, Enum):
    NEW = "new"
    INVESTIGATING = "investigating"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class IncidentBase(BaseModel):
    title: str = Field(..., example="Network outage")
    description: Optional[str] = Field(None, example="Description of the incident")
    severity: IncidentSeverity = IncidentSeverity.MEDIUM
    status: IncidentStatus = IncidentStatus.NEW
    category: Optional[str] = None
    impact: Optional[str] = None
    urgency: Optional[str] = None


class IncidentCreate(IncidentBase):
    reporter_id: int
    assignee_id: Optional[int] = None


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[IncidentSeverity] = None
    status: Optional[IncidentStatus] = None
    category: Optional[str] = None
    impact: Optional[str] = None
    urgency: Optional[str] = None
    assignee_id: Optional[int] = None
    resolution: Optional[str] = None


class IncidentInDB(IncidentBase):
    id: int
    incident_id: str
    reporter_id: int
    assignee_id: Optional[int] = None
    resolution: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Incident(IncidentInDB):
    reporter: Optional[dict] = None
    assignee: Optional[dict] = None


class IncidentList(BaseModel):
    items: List[Incident]
    total: int
    page: int
    size: int
    pages: int
