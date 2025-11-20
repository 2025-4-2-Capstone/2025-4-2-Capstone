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

    # 🎯 변경된 컬럼 구조
    priority = Column(String(20), nullable=False)   # low / normal / high / urgent
    response_time_days = Column(Integer, nullable=False)  # 목표 응답 기간(일)
    resolve_time_days = Column(Integer, nullable=False)   # 목표 해결 기간(일)

    # 🔥 Ticket과 연결 (양방향)
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

    # -----------------------------
    #   🔥 고급 감사 정보 확장
    # -----------------------------
    session_id = Column(String(200), nullable=True)          # ⭐ JWT 앞부분 저장
    ip_address = Column(String(100), nullable=True)          # 사용자 IP 기록
    user_agent = Column(String(255), nullable=True)          # 브라우저/디바이스 정보
    changed_fields = Column(Text, nullable=True)             # 변경된 필드(JSON 문자열)
    target_department_id = Column(Integer, nullable=True)    # 작업 대상 부서

    # 관계 유지
    user = relationship("User", back_populates="audit_logs")





class PiiToken(Base):
    __tablename__ = "pii_tokens"

    id = Column(Integer, primary_key=True)
    real_data = Column(Text)
    token = Column(String, unique=True)
    created_at = Column(TIMESTAMP)
