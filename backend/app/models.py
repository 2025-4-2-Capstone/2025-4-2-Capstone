from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy import Text

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    hierarchy_level = Column(Integer, nullable=False)  # ✅ 역할 계층 레벨 (1=최고관리자)
    description = Column(String(200))  # ✅ 역할 설명

    users = relationship("User", back_populates="role")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    # ✅ 기존: users 관계
    users = relationship("User", back_populates="department")

    # ✅ 추가: tickets 관계
    tickets = relationship("Ticket", back_populates="department")



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    is_active = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    role = relationship("Role", back_populates="users")
    department = relationship("Department", back_populates="users")

   # ✅ 티켓 관계 (foreign_keys 명시)
    tickets_created = relationship(
        "Ticket",
        back_populates="creator",
        foreign_keys="Ticket.created_by"
    )

    tickets_assigned = relationship(
        "Ticket",
        back_populates="assignee",
        foreign_keys="Ticket.assigned_to"
    )

    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")



class SlaPolicy(Base):
    __tablename__ = "sla_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    target_response_minutes = Column(Integer, nullable=False)  # ✅ 응답 목표 시간(분)
    target_resolution_minutes = Column(Integer, nullable=False)  # ✅ 해결 목표 시간(분)
    description = Column(Text, nullable=True)  # ✅ 정책 설명 (선택사항)

    # ✅ Ticket과의 양방향 관계
    tickets = relationship("Ticket", back_populates="sla_policy")



class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="open")
    priority = Column(String(20), default="normal")

    created_by = Column(Integer, ForeignKey("users.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"))
    sla_policy_id = Column(Integer, ForeignKey("sla_policies.id"))
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    # ✅ FK 명시 및 순환 방지 (cascade="none")
    creator = relationship(
        "User",
        foreign_keys=[created_by],
        back_populates="tickets_created",
        cascade="none"
    )
    assignee = relationship(
        "User",
        foreign_keys=[assigned_to],
        back_populates="tickets_assigned",
        cascade="none"
    )

    sla_policy = relationship("SlaPolicy", back_populates="tickets")
    department = relationship("Department", back_populates="tickets")
    sla_alerts = relationship("SLAAlert", back_populates="ticket")



class TicketTransition(Base):
    __tablename__ = "ticket_transitions"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    from_status = Column(String(50))
    to_status = Column(String(50))
    changed_by = Column(Integer, ForeignKey("users.id"))
    changed_at = Column(TIMESTAMP)
    comment = Column(Text)
    ticket = relationship("Ticket", backref="transitions")



# ✅ SLAAlert 모델
class SLAAlert(Base):
    __tablename__ = "sla_alerts"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    alert_type = Column(String(50))
    triggered_at = Column(TIMESTAMP)
    resolved = Column(Boolean, default=False)

    # ✅ Ticket과의 관계 (양방향)
    ticket = relationship("Ticket", back_populates="sla_alerts")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100))
    target_table = Column(String(100))
    target_id = Column(Integer)
    details = Column(Text)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now())

    # ✅ 여기가 핵심 — 누락되어 있던 관계 정의
    user = relationship("User", back_populates="audit_logs")



class PiiToken(Base):
    __tablename__ = "pii_tokens"

    id = Column(Integer, primary_key=True)
    real_data = Column(Text)
    token = Column(String, unique=True)
    created_at = Column(TIMESTAMP)
