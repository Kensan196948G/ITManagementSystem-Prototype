from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Union
from datetime import datetime

# Userスキーマ（既存のものを模倣）
class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


# Commentスキーマ (既存のものを模倣、problem_id を追加)
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    incident_id: Optional[int] = None
    problem_id: Optional[int] = None
    user_id: int
    created_at: datetime
    username: Optional[str] = None # User.username を表示するため

    model_config = ConfigDict(from_attributes=True)


# Attachmentスキーマ (既存のものを模倣、problem_id を追加)
class AttachmentBase(BaseModel):
    filename: str
    # filepath はセキュリティリスクのためレスポンスに含めないことを推奨
    # filesize: Optional[int] = None

class AttachmentCreate(AttachmentBase):
    # 必要に応じてファイルアップロード関連のフィールドを追加
    pass

class Attachment(AttachmentBase):
    id: int
    incident_id: Optional[int] = None
    problem_id: Optional[int] = None
    filesize: Optional[int] = None
    uploaded_by_id: int
    uploaded_by: Optional[str] = None # User.username を表示するため
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ProblemStatus スキーマ
class ProblemStatusBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProblemStatusCreate(ProblemStatusBase):
    pass

class ProblemStatus(ProblemStatusBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ProblemPriority スキーマ
class ProblemPriorityBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProblemPriorityCreate(ProblemPriorityBase):
    pass

class ProblemPriority(ProblemPriorityBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ProblemCategory スキーマ
class ProblemCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProblemCategoryCreate(ProblemCategoryBase):
    pass

class ProblemCategory(ProblemCategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# RootCauseAnalysis スキーマ
class RootCauseAnalysisBase(BaseModel):
    description: str
    identified_by_id: Optional[int] = None
    # identified_at は自動設定

class RootCauseAnalysisCreate(RootCauseAnalysisBase):
    pass

class RootCauseAnalysis(RootCauseAnalysisBase):
    id: int
    problem_id: int
    identified_at: datetime
    created_at: datetime
    updated_at: datetime
    identified_by: Optional[User] = None

    model_config = ConfigDict(from_attributes=True)


# Workaround スキーマ
class WorkaroundBase(BaseModel):
    description: str
    implemented_by_id: Optional[int] = None
    implemented_at: Optional[datetime] = None
    effectiveness_notes: Optional[str] = None

class WorkaroundCreate(WorkaroundBase):
    pass

class Workaround(WorkaroundBase):
    id: int
    problem_id: int
    created_at: datetime
    updated_at: datetime
    implemented_by: Optional[User] = None

    model_config = ConfigDict(from_attributes=True)


# Problem スキーマ
class ProblemBase(BaseModel):
    title: str
    description: str
    impact_description: Optional[str] = None
    known_error_status: Optional[str] = None
    status_id: int
    priority_id: int
    category_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    # reported_by_id は認証ユーザーから取得

class ProblemCreate(ProblemBase):
    linked_incident_ids: Optional[List[int]] = []

class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    impact_description: Optional[str] = None
    known_error_status: Optional[str] = None
    status_id: Optional[int] = None
    priority_id: Optional[int] = None
    category_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    linked_incident_ids: Optional[List[int]] = None # 関連インシデントの更新用


class Problem(ProblemBase):
    id: int
    reported_by_id: int
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    status: Optional[ProblemStatus] = None
    priority: Optional[ProblemPriority] = None
    category: Optional[ProblemCategory] = None
    reporter: Optional[User] = None
    assignee: Optional[User] = None

    # to_dict の include_details=True に対応するフィールド
    linked_incidents: Optional[List['IncidentShallow']] = [] # Incidentスキーマを前方参照 (循環参照回避のため)
    comments: Optional[List[Comment]] = []
    attachments: Optional[List[Attachment]] = []
    root_cause_analyses: Optional[List[RootCauseAnalysis]] = []
    workarounds: Optional[List[Workaround]] = []

    comments_count: Optional[int] = 0
    attachments_count: Optional[int] = 0
    root_cause_analyses_count: Optional[int] = 0
    workarounds_count: Optional[int] = 0
    linked_incidents_count: Optional[int] = 0


    model_config = ConfigDict(from_attributes=True)

# Incident の簡易版スキーマ (Problem内で利用)
class IncidentShallowBase(BaseModel):
    title: str
    status_id: int # status.name を含めるかは要件次第
    priority_id: int # priority.name を含めるかは要件次第

class IncidentShallow(IncidentShallowBase):
    id: int
    created_at: datetime
    # 必要に応じて他のフィールドを追加

    model_config = ConfigDict(from_attributes=True)

# Problem.model_rebuild() を呼び出して前方参照を解決
Problem.model_rebuild()


# ProblemIncidentLink スキーマ (必要に応じて)
class ProblemIncidentLinkBase(BaseModel):
    problem_id: int
    incident_id: int

class ProblemIncidentLinkCreate(ProblemIncidentLinkBase):
    pass

class ProblemIncidentLink(ProblemIncidentLinkBase):
    # このモデルは通常、直接APIでやり取りするよりは、Problem作成/更新時に内部的に処理される
    pass

    model_config = ConfigDict(from_attributes=True)