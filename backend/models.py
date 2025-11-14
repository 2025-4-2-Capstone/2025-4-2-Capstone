from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, Boolean
from sqlalchemy.orm import relationship
from database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100))
    password_hash = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    created_at = Column(TIMESTAMP)

    role = relationship("Role")


class SlaPolicy(Base):
    __tablename__ = "sla_policies"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    target_response_minutes = Column(Integer)
    target_resolution_minutes = Column(Integer)


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="open")
    priority = Column(String(20))
    created_by = Column(Integer, ForeignKey("users.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"))
    sla_policy_id = Column(Integer, ForeignKey("sla_policies.id"))
    created_at = Column(TIMESTAMP)
    updated_at = Column(TIMESTAMP)

    # ✅ 추가: SLAAlert와의 관계
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


# ✅ 수정: 클래스 이름을 SLAAlert로 대문자 통일
class SLAAlert(Base):
    __tablename__ = "sla_alerts"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    alert_type = Column(String(50))
    triggered_at = Column(TIMESTAMP)
    resolved = Column(Boolean, default=False)

    # ✅ 추가: Ticket과의 관계
    ticket = relationship("Ticket", back_populates="sla_alerts")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100))
    target_table = Column(String(50))
    target_id = Column(Integer)
    details = Column(Text)
    timestamp = Column(TIMESTAMP)


class PiiToken(Base):
    __tablename__ = "pii_tokens"

    id = Column(Integer, primary_key=True)
    real_data = Column(Text)
    token = Column(String, unique=True)
    created_at = Column(TIMESTAMP)
