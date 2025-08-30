import os
import shutil  # ファイル操作用
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.database import get_db
from backend.dependencies import get_current_active_user  # ダミーの認証を使用

# 実際のUserモデルとスキーマを使用する場合は以下のようにする
# from backend.models.user import User as UserModel
# from backend.schemas.user import User as UserSchema

# アップロードディレクトリの設定
UPLOAD_DIR_PROBLEMS = "uploads/problems"
if not os.path.exists(UPLOAD_DIR_PROBLEMS):
    os.makedirs(UPLOAD_DIR_PROBLEMS, exist_ok=True)

router = APIRouter(
    prefix="/api/problems",
    tags=["Problems"],  # APIドキュメントでのタグ名
)


# --- ヘルパー関数 ---
def get_problem_or_404(problem_id: int, db: Session):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Problem with id {problem_id} not found",
        )
    return problem


# --- 問題 (Problem) のCRUD ---


@router.post("", response_model=schemas.Problem, status_code=status.HTTP_201_CREATED)
async def create_problem(
    problem_in: schemas.ProblemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        get_current_active_user
    ),  # Userスキーマはdependenciesのもの
):
    """
    新しい問題を作成します。
    - **title**: 問題のタイトル (必須)
    - **description**: 問題の詳細な説明 (必須)
    - **impact_description**: 影響範囲の説明
    - **known_error_status**: 既知のエラーとしての状態
    - **status_id**: 問題ステータスID (必須)
    - **priority_id**: 問題優先度ID (必須)
    - **category_id**: 問題カテゴリID
    - **assigned_to_id**: 担当者のユーザーID
    - **linked_incident_ids**: 関連付けるインシデントのIDリスト
    """
    # 存在チェック: status_id, priority_id, category_id, assigned_to_id
    if (
        not db.query(models.ProblemStatus)
        .filter(models.ProblemStatus.id == problem_in.status_id)
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ProblemStatus with id {problem_in.status_id} not found.",
        )
    if (
        not db.query(models.ProblemPriority)
        .filter(models.ProblemPriority.id == problem_in.priority_id)
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ProblemPriority with id {problem_in.priority_id} not found.",
        )
    if (
        problem_in.category_id
        and not db.query(models.ProblemCategory)
        .filter(models.ProblemCategory.id == problem_in.category_id)
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ProblemCategory with id {problem_in.category_id} not found.",
        )
    if (
        problem_in.assigned_to_id
        and not db.query(models.User)
        .filter(models.User.id == problem_in.assigned_to_id)
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User (assignee) with id {problem_in.assigned_to_id} not found.",
        )

    db_problem = models.Problem(
        **problem_in.model_dump(exclude={"linked_incident_ids"}),
        reported_by_id=current_user.id,
    )
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)

    # 関連インシデントの処理
    if problem_in.linked_incident_ids:
        for incident_id in problem_in.linked_incident_ids:
            incident = (
                db.query(models.Incident)
                .filter(models.Incident.id == incident_id)
                .first()
            )
            if incident:
                link = models.ProblemIncidentLink(
                    problem_id=db_problem.id, incident_id=incident_id
                )
                db.add(link)
            else:
                # 存在しないインシデントIDが指定された場合の警告ログ等をここに追加可能
                print(
                    f"Warning: Incident with id {incident_id} not found when linking to problem {db_problem.id}"
                )
        db.commit()
        db.refresh(db_problem)  # リンク後の状態を再読み込み

    return db_problem


@router.get("", response_model=List[schemas.Problem])
async def read_problems(
    skip: int = 0,
    limit: int = 100,
    status_id: Optional[int] = None,
    priority_id: Optional[int] = None,
    category_id: Optional[int] = None,
    assigned_to_id: Optional[int] = None,
    reported_by_id: Optional[int] = None,
    keyword: Optional[str] = None,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_active_user) # 一覧取得は認証なしでも良いケースあり
):
    """
    問題の一覧を取得します。オプションでフィルタリングとページネーションが可能です。
    - **skip**: スキップするレコード数
    - **limit**: 取得する最大レコード数
    - **status_id**: ステータスIDでフィルタ
    - **priority_id**: 優先度IDでフィルタ
    - **category_id**: カテゴリIDでフィルタ
    - **assigned_to_id**: 担当者IDでフィルタ
    - **reported_by_id**:報告者IDでフィルタ
    - **keyword**: タイトルまたは説明に含まれるキーワードでフィルタ
    """
    query = db.query(models.Problem)

    if status_id is not None:
        query = query.filter(models.Problem.status_id == status_id)
    if priority_id is not None:
        query = query.filter(models.Problem.priority_id == priority_id)
    if category_id is not None:
        query = query.filter(models.Problem.category_id == category_id)
    if assigned_to_id is not None:
        query = query.filter(models.Problem.assigned_to_id == assigned_to_id)
    if reported_by_id is not None:
        query = query.filter(models.Problem.reported_by_id == reported_by_id)
    if keyword:
        query = query.filter(
            (models.Problem.title.ilike(f"%{keyword}%"))
            | (models.Problem.description.ilike(f"%{keyword}%"))
        )

    problems = (
        query.order_by(models.Problem.created_at.desc()).offset(skip).limit(limit).all()
    )
    return problems


@router.get("/{problem_id}", response_model=schemas.Problem)
async def read_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_active_user)
):
    """
    指定されたIDの問題詳細を取得します。
    関連するコメント、添付ファイル、RCA、回避策も含まれます。
    """
    db_problem = get_problem_or_404(problem_id, db)
    # Pydanticスキーマがリレーションを解決してくれる
    return db_problem


@router.put("/{problem_id}", response_model=schemas.Problem)
async def update_problem(
    problem_id: int,
    problem_in: schemas.ProblemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    指定されたIDの問題情報を更新します。
    更新可能なフィールドは `ProblemUpdate` スキーマを参照してください。
    """
    db_problem = get_problem_or_404(problem_id, db)

    update_data = problem_in.model_dump(
        exclude_unset=True, exclude={"linked_incident_ids"}
    )

    # 存在チェック: status_id, priority_id, category_id, assigned_to_id
    if (
        "status_id" in update_data
        and not db.query(models.ProblemStatus)
        .filter(models.ProblemStatus.id == update_data["status_id"])
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ProblemStatus with id {update_data['status_id']} not found.",
        )
    if (
        "priority_id" in update_data
        and not db.query(models.ProblemPriority)
        .filter(models.ProblemPriority.id == update_data["priority_id"])
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ProblemPriority with id {update_data['priority_id']} not found.",
        )
    if (
        "category_id" in update_data
        and update_data["category_id"] is not None
        and not db.query(models.ProblemCategory)
        .filter(models.ProblemCategory.id == update_data["category_id"])
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ProblemCategory with id {update_data['category_id']} not found.",
        )
    if (
        "assigned_to_id" in update_data
        and update_data["assigned_to_id"] is not None
        and not db.query(models.User)
        .filter(models.User.id == update_data["assigned_to_id"])
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User (assignee) with id {update_data['assigned_to_id']} not found.",
        )

    for field, value in update_data.items():
        setattr(db_problem, field, value)

    # 関連インシデントの更新処理
    if problem_in.linked_incident_ids is not None:
        # 既存のリンクを一旦全て削除
        db.query(models.ProblemIncidentLink).filter(
            models.ProblemIncidentLink.problem_id == problem_id
        ).delete()
        # 新しいリンクを追加
        for incident_id in problem_in.linked_incident_ids:
            incident = (
                db.query(models.Incident)
                .filter(models.Incident.id == incident_id)
                .first()
            )
            if incident:
                link = models.ProblemIncidentLink(
                    problem_id=problem_id, incident_id=incident_id
                )
                db.add(link)
            else:
                print(
                    f"Warning: Incident with id {incident_id} not found when updating links for problem {problem_id}"
                )

    db.commit()
    db.refresh(db_problem)
    return db_problem


@router.delete("/{problem_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),  # 権限チェックが必要
):
    """
    指定されたIDの問題を削除します。
    関連するRCA、回避策、コメント、添付ファイルもカスケード削除されます（モデル定義による）。
    """
    db_problem = get_problem_or_404(problem_id, db)
    # TODO: 権限チェック (例: current_user が報告者または管理者か)
    db.delete(db_problem)
    db.commit()
    return None  # HTTP 204 No Content


# --- 根本原因分析 (RootCauseAnalysis) ---


@router.post(
    "/{problem_id}/rca",
    response_model=schemas.RootCauseAnalysis,
    status_code=status.HTTP_201_CREATED,
)
async def create_root_cause_analysis(
    problem_id: int,
    rca_in: schemas.RootCauseAnalysisCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    特定の問題に根本原因分析を登録します。
    """
    db_problem = get_problem_or_404(problem_id, db)
    if (
        rca_in.identified_by_id
        and not db.query(models.User)
        .filter(models.User.id == rca_in.identified_by_id)
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User (identifier) with id {rca_in.identified_by_id} not found.",
        )

    db_rca = models.RootCauseAnalysis(
        **rca_in.model_dump(),
        problem_id=db_problem.id,
        # identified_by_id はスキーマから、または current_user.id をデフォルトにすることも検討
    )
    if rca_in.identified_by_id is None:  # 指定がなければ現在のユーザーを特定者とする
        db_rca.identified_by_id = current_user.id

    db.add(db_rca)
    db.commit()
    db.refresh(db_rca)
    return db_rca


@router.get("/{problem_id}/rca", response_model=List[schemas.RootCauseAnalysis])
async def read_root_cause_analyses(problem_id: int, db: Session = Depends(get_db)):
    """
    特定の問題の根本原因分析の一覧を取得します。
    """
    db_problem = get_problem_or_404(problem_id, db)
    return db_problem.root_cause_analyses


# --- 回避策 (Workaround) ---


@router.post(
    "/{problem_id}/workarounds",
    response_model=schemas.Workaround,
    status_code=status.HTTP_201_CREATED,
)
async def create_workaround(
    problem_id: int,
    workaround_in: schemas.WorkaroundCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    特定の問題に回避策を登録します。
    """
    db_problem = get_problem_or_404(problem_id, db)
    if (
        workaround_in.implemented_by_id
        and not db.query(models.User)
        .filter(models.User.id == workaround_in.implemented_by_id)
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User (implementer) with id {workaround_in.implemented_by_id} not found.",
        )

    db_workaround = models.Workaround(
        **workaround_in.model_dump(), problem_id=db_problem.id
    )
    # implemented_by_id が指定されていなければ、現在のユーザーをデフォルトにすることも検討
    if workaround_in.implemented_by_id is None:
        db_workaround.implemented_by_id = current_user.id

    db.add(db_workaround)
    db.commit()
    db.refresh(db_workaround)
    return db_workaround


@router.get("/{problem_id}/workarounds", response_model=List[schemas.Workaround])
async def read_workarounds(problem_id: int, db: Session = Depends(get_db)):
    """
    特定の問題の回避策の一覧を取得します。
    """
    db_problem = get_problem_or_404(problem_id, db)
    return db_problem.workarounds


@router.put(
    "/{problem_id}/workarounds/{workaround_id}", response_model=schemas.Workaround
)
async def update_workaround(
    problem_id: int,
    workaround_id: int,
    workaround_in: schemas.WorkaroundCreate,  # 更新はCreateスキーマを流用 (部分更新は別途Updateスキーマを作成)
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    特定の問題の特定の回避策を更新します。
    """
    db_problem = get_problem_or_404(problem_id, db)
    db_workaround = (
        db.query(models.Workaround)
        .filter(
            models.Workaround.id == workaround_id,
            models.Workaround.problem_id == problem_id,
        )
        .first()
    )
    if not db_workaround:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workaround with id {workaround_id} for problem {problem_id} not found",
        )

    update_data = workaround_in.model_dump(exclude_unset=True)
    if (
        "implemented_by_id" in update_data
        and update_data["implemented_by_id"] is not None
        and not db.query(models.User)
        .filter(models.User.id == update_data["implemented_by_id"])
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User (implementer) with id {update_data['implemented_by_id']} not found.",
        )

    for field, value in update_data.items():
        setattr(db_workaround, field, value)

    db.commit()
    db.refresh(db_workaround)
    return db_workaround


@router.delete(
    "/{problem_id}/workarounds/{workaround_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_workaround(
    problem_id: int,
    workaround_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    特定の問題の特定の回避策を削除します。
    """
    db_problem = get_problem_or_404(problem_id, db)
    db_workaround = (
        db.query(models.Workaround)
        .filter(
            models.Workaround.id == workaround_id,
            models.Workaround.problem_id == problem_id,
        )
        .first()
    )
    if not db_workaround:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workaround with id {workaround_id} for problem {problem_id} not found",
        )

    db.delete(db_workaround)
    db.commit()
    return None


# --- コメント (Comment) ---
# Incident管理と同様のロジックを参考に実装


@router.post(
    "/{problem_id}/comments",
    response_model=schemas.Comment,
    status_code=status.HTTP_201_CREATED,
)
async def add_problem_comment(
    problem_id: int,
    comment_in: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    特定の問題にコメントを追加します。
    """
    db_problem = get_problem_or_404(problem_id, db)
    db_comment = models.Comment(
        content=comment_in.content,
        problem_id=db_problem.id,
        user_id=current_user.id,  # ログインユーザーID
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    # username を含めるために、User情報を結合して返すか、スキーマ側で対応
    # ここではスキーマが username を Optional で持っているので、明示的に設定はしない
    # 必要なら、db_comment.user をロードして username を取得する
    return db_comment


@router.get("/{problem_id}/comments", response_model=List[schemas.Comment])
async def get_problem_comments(problem_id: int, db: Session = Depends(get_db)):
    """
    特定の問題のコメント一覧を取得します。
    """
    db_problem = get_problem_or_404(problem_id, db)
    # コメントスキーマ側で username を解決できるように、リレーションシップがロードされることを期待
    # 必要であれば joinedload(models.Comment.user) などを使用
    comments = (
        db.query(models.Comment)
        .filter(models.Comment.problem_id == problem_id)
        .order_by(models.Comment.created_at.asc())
        .all()
    )
    return comments


# --- 添付ファイル (Attachment) ---
# Incident管理と同様のロジックを参考に実装


def get_problem_attachment_dir(problem_id: int):
    attachment_dir = os.path.join(UPLOAD_DIR_PROBLEMS, str(problem_id))
    os.makedirs(attachment_dir, exist_ok=True)
    return attachment_dir


@router.post(
    "/{problem_id}/attachments",
    response_model=schemas.Attachment,
    status_code=status.HTTP_201_CREATED,
)
async def add_problem_attachment(
    problem_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    特定の問題にファイルを添付します。
    """
    db_problem = get_problem_or_404(problem_id, db)
    attachment_dir = get_problem_attachment_dir(problem_id)

    # ファイル名を安全にする（werkzeugはFlask用なので、ここでは単純なreplace等で対応するか、ライブラリ導入）
    # ここでは簡易的にファイル名そのまま or FastAPI の UploadFile.filename を信頼
    filename = file.filename
    filepath = os.path.join(attachment_dir, filename)

    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {e}",
        )
    finally:
        await file.close()  # 必ずファイルをクローズ

    db_attachment = models.Attachment(
        filename=filename,
        filepath=filepath,  # 相対パスまたは絶対パス。ここでは相対パスを想定。
        filesize=os.path.getsize(filepath),  # 保存後のファイルサイズを取得
        problem_id=db_problem.id,
        uploaded_by_id=current_user.id,
    )
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment


@router.get("/{problem_id}/attachments", response_model=List[schemas.Attachment])
async def get_problem_attachments(problem_id: int, db: Session = Depends(get_db)):
    """
    特定の問題の添付ファイル一覧を取得します。
    """
    db_problem = get_problem_or_404(problem_id, db)
    # スキーマ側で uploaded_by (username) を解決できるように期待
    attachments = (
        db.query(models.Attachment)
        .filter(models.Attachment.problem_id == problem_id)
        .all()
    )
    return attachments


# --- マスタデータ取得API ---


@router.get(
    "/statuses/", response_model=List[schemas.ProblemStatus]
)  # 末尾のスラッシュで /statuses と区別
async def read_problem_statuses(db: Session = Depends(get_db)):
    """問題ステータスの一覧を取得します。"""
    return db.query(models.ProblemStatus).order_by(models.ProblemStatus.id).all()


@router.get("/priorities/", response_model=List[schemas.ProblemPriority])
async def read_problem_priorities(db: Session = Depends(get_db)):
    """問題優先度の一覧を取得します。"""
    return db.query(models.ProblemPriority).order_by(models.ProblemPriority.id).all()


@router.get("/categories/", response_model=List[schemas.ProblemCategory])
async def read_problem_categories(db: Session = Depends(get_db)):
    """問題カテゴリの一覧を取得します。"""
    return db.query(models.ProblemCategory).order_by(models.ProblemCategory.id).all()
