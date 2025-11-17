from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

import app.models as models
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter(tags=["Users"])


# ============================
# 📌 승인 요청 Body 정의
# ============================
class ApproveUserRequest(BaseModel):
    role_id: int
    department_id: int


# ============================
# 📌 승인 대기 목록 조회
# ============================
@router.get("/pending-users")
def get_pending_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.name not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="관리자만 접근 가능합니다.")

    return db.query(models.User).filter(models.User.is_active == False).all()


# ============================
# 📌 사용자 승인 (역할 + 부서 배정)
# ============================
@router.post("/approve-user/{user_id}")
def approve_user(
    user_id: int,
    body: ApproveUserRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 접근권한 검사
    if current_user.role.name not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="관리자만 승인할 수 있습니다.")

    # 사용자 조회
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 중복 승인 방지
    if user.is_active:
        return {"msg": f"{user.username} 계정은 이미 활성화되어 있습니다."}

    # 역할 존재 여부 체크
    role = db.query(models.Role).filter(models.Role.id == body.role_id).first()
    if not role:
        raise HTTPException(status_code=400, detail="존재하지 않는 역할입니다.")

    # 부서 존재 여부 체크
    department = db.query(models.Department).filter(models.Department.id == body.department_id).first()
    if not department:
        raise HTTPException(status_code=400, detail="존재하지 않는 부서입니다.")

    # 승인(권한 + 부서 + 활성화 처리)
    user.role_id = body.role_id
    user.department_id = body.department_id
    user.is_active = True

    db.commit()
    db.refresh(user)

    return {
        "msg": f"{user.username} 계정 승인 완료",
        "role": role.name,
        "department": department.name,
        "is_active": user.is_active
    }
