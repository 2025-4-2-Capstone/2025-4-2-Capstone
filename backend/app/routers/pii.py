from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from uuid import uuid4
from pydantic import BaseModel

import app.models as models
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter(tags=["PII Tokenization"])


class TokenizeRequest(BaseModel):
    data: str


class TokenizeResponse(BaseModel):
    token: str


class DecodeResponse(BaseModel):
    real_data: str


@router.post("/pii/tokenize", response_model=TokenizeResponse)
def tokenize_pii(
    request: TokenizeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing = db.query(models.PiiToken).filter(models.PiiToken.real_data == request.data).first()
    if existing:
        return {"token": existing.token}

    new_token = f"tok_{uuid4().hex[:12]}"
    pii = models.PiiToken(
        real_data=request.data,
        token=new_token,
        created_at=datetime.utcnow()
    )
    db.add(pii)
    db.commit()
    db.refresh(pii)
    return {"token": pii.token}


@router.get("/pii/decode/{token}", response_model=DecodeResponse)
def decode_token(
    token: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    pii = db.query(models.PiiToken).filter(models.PiiToken.token == token).first()
    if not pii:
        raise HTTPException(status_code=404, detail="Token not found")
    return {"real_data": pii.real_data}
