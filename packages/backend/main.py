"""
FastAPI ITサービス管理システム（ITSM）
ISO 20000/27001/27002準拠のメインアプリケーション
"""

import sys
import os
import logging
from datetime import timedelta
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

# プロジェクトルートをPythonパスに追加
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)

# データベースとモデル
from packages.backend.database import get_db, engine
from packages.backend.models.user import User
from packages.backend.models.incident import Incident
from packages.backend.models.problem import Problem
from packages.backend.models.change import Change

# スキーマ
from packages.backend.schemas.user import UserLogin, Token, UserMe, UserCreate, User as UserSchema, UserList
from packages.backend.schemas.incident import IncidentCreate, IncidentUpdate, Incident as IncidentSchema, IncidentList
from packages.backend.schemas.problem import ProblemCreate, ProblemUpdate, Problem as ProblemSchema, ProblemList
from packages.backend.schemas.change import ChangeCreate, ChangeUpdate, Change as ChangeSchema, ChangeList

# 認証ユーティリティ
from packages.backend.utils.auth import (
    authenticate_user,
    create_access_token,
    get_current_active_user,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPIアプリケーション初期化
app = FastAPI(
    title="ITSM API",
    description="ITサービス管理システム API - ISO 20000/27001/27002準拠",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://192.168.3.135:3000",
        "http://192.168.3.135:5173",
        "http://192.168.3.135:5174",
        "http://192.168.3.135:5175",
        "http://192.168.3.135:5176",
        "*"  # 開発環境のため全オリジン許可
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# エラーハンドリング
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# ヘルスチェック
@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # データベース接続テスト
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

# 認証エンドポイント
@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # 最終ログイン時刻を更新
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/logout")
async def logout():
    # JWTはステートレスのため、クライアント側でトークンを削除
    return {"message": "Successfully logged out"}

@app.get("/api/auth/me", response_model=UserMe)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    user_roles = [role.name for role in current_user.roles] if current_user.roles else []
    return UserMe(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        department=current_user.department,
        job_title=current_user.job_title,
        is_active=current_user.is_active,
        roles=user_roles
    )

# インシデント管理エンドポイント
@app.get("/api/incidents", response_model=IncidentList)
async def get_incidents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    incidents = db.query(Incident).offset(skip).limit(limit).all()
    total = db.query(Incident).count()
    return IncidentList(
        items=incidents,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@app.post("/api/incidents", response_model=IncidentSchema)
async def create_incident(
    incident: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_incident = Incident(**incident.dict())
    # インシデントIDの生成（例：INC-YYYY-NNNN）
    from datetime import datetime
    year = datetime.now().year
    count = db.query(Incident).count() + 1
    db_incident.incident_id = f"INC-{year}-{count:04d}"
    
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

@app.get("/api/incidents/{incident_id}", response_model=IncidentSchema)
async def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@app.put("/api/incidents/{incident_id}", response_model=IncidentSchema)
async def update_incident(
    incident_id: int,
    incident_update: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    for field, value in incident_update.dict(exclude_unset=True).items():
        setattr(incident, field, value)
    
    from datetime import datetime
    incident.updated_at = datetime.utcnow()
    if incident_update.status == "resolved":
        incident.resolved_at = datetime.utcnow()
    elif incident_update.status == "closed":
        incident.closed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(incident)
    return incident

@app.delete("/api/incidents/{incident_id}")
async def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    db.delete(incident)
    db.commit()
    return {"message": "Incident deleted successfully"}

# 問題管理エンドポイント
@app.get("/api/problems", response_model=ProblemList)
async def get_problems(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    problems = db.query(Problem).offset(skip).limit(limit).all()
    total = db.query(Problem).count()
    return ProblemList(
        items=problems,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@app.post("/api/problems", response_model=ProblemSchema)
async def create_problem(
    problem: ProblemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_problem = Problem(**problem.dict())
    # 問題IDの生成（例：PRB-YYYY-NNNN）
    from datetime import datetime
    year = datetime.now().year
    count = db.query(Problem).count() + 1
    db_problem.problem_id = f"PRB-{year}-{count:04d}"
    
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem

@app.get("/api/problems/{problem_id}", response_model=ProblemSchema)
async def get_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if problem is None:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

@app.put("/api/problems/{problem_id}", response_model=ProblemSchema)
async def update_problem(
    problem_id: int,
    problem_update: ProblemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if problem is None:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    for field, value in problem_update.dict(exclude_unset=True).items():
        setattr(problem, field, value)
    
    from datetime import datetime
    problem.updated_at = datetime.utcnow()
    if problem_update.status == "resolved":
        problem.resolved_at = datetime.utcnow()
    elif problem_update.status == "closed":
        problem.closed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(problem)
    return problem

# 変更要求管理エンドポイント
@app.get("/api/changes", response_model=ChangeList)
async def get_changes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    changes = db.query(Change).offset(skip).limit(limit).all()
    total = db.query(Change).count()
    return ChangeList(
        items=changes,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@app.post("/api/changes", response_model=ChangeSchema)
async def create_change(
    change: ChangeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_change = Change(**change.dict())
    # 変更IDの生成（例：CHG-YYYY-NNNN）
    from datetime import datetime
    year = datetime.now().year
    count = db.query(Change).count() + 1
    db_change.change_id = f"CHG-{year}-{count:04d}"
    
    db.add(db_change)
    db.commit()
    db.refresh(db_change)
    return db_change

@app.get("/api/changes/{change_id}", response_model=ChangeSchema)
async def get_change(
    change_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    change = db.query(Change).filter(Change.id == change_id).first()
    if change is None:
        raise HTTPException(status_code=404, detail="Change not found")
    return change

@app.put("/api/changes/{change_id}", response_model=ChangeSchema)
async def update_change(
    change_id: int,
    change_update: ChangeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    change = db.query(Change).filter(Change.id == change_id).first()
    if change is None:
        raise HTTPException(status_code=404, detail="Change not found")
    
    for field, value in change_update.dict(exclude_unset=True).items():
        setattr(change, field, value)
    
    from datetime import datetime
    change.updated_at = datetime.utcnow()
    if change_update.status == "implementation":
        change.actual_start = datetime.utcnow()
    elif change_update.status == "complete":
        change.actual_end = datetime.utcnow()
    
    db.commit()
    db.refresh(change)
    return change

# ユーザー管理エンドポイント
@app.get("/api/users", response_model=UserList)
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    users = db.query(User).offset(skip).limit(limit).all()
    total = db.query(User).count()
    return UserList(
        items=users,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@app.post("/api/users", response_model=UserSchema)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # ユーザー名とメールの重複チェック
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    password = user_dict.pop('password')
    hashed_password = get_password_hash(password)
    
    db_user = User(**user_dict, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/api/users/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_update: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    for field, value in user_update.dict(exclude_unset=True).items():
        if field != 'password':
            setattr(user, field, value)
    
    from datetime import datetime
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    return user

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
