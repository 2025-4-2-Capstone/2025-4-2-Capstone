# models.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, Boolean
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100))
    role_id = Column(Integer, ForeignKey("roles.id"))
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    role = relationship("Role", back_populates="users")
    created_tickets = relationship("Ticket", foreign_keys='Ticket.created_by', back_populates="creator")
    assigned_tickets = relationship("Ticket", foreign_keys='Ticket.assigned_to', back_populates="assignee")


class SLAPolicy(Base):
    __tablename__ = "sla_policies"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    target_response_minutes = Column(Integer)
    target_resolution_minutes = Column(Integer)

    tickets = relationship("Ticket", back_populates="sla_policy")


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
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow)

    creator = relationship("User", foreign_keys=[created_by], back_populates="created_tickets")
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_tickets")
    sla_policy = relationship("SLAPolicy", back_populates="tickets")
    transitions = relationship("TicketTransition", back_populates="ticket")


class TicketTransition(Base):
    __tablename__ = "ticket_transitions"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    from_status = Column(String(50))
    to_status = Column(String(50))
    changed_by = Column(Integer, ForeignKey("users.id"))
    changed_at = Column(TIMESTAMP, default=datetime.utcnow)
    comment = Column(Text)

    ticket = relationship("Ticket", back_populates="transitions")


class SLAAlert(Base):
    __tablename__ = "sla_alerts"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    alert_type = Column(String(50))
    triggered_at = Column(TIMESTAMP, default=datetime.utcnow)
    resolved = Column(Boolean, default=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100))
    target_table = Column(String(50))
    target_id = Column(Integer)
    details = Column(Text)
    timestamp = Column(TIMESTAMP, default=datetime.utcnow)


class PIIToken(Base):
    __tablename__ = "pii_tokens"

    id = Column(Integer, primary_key=True)
    real_data = Column(Text)
    token = Column(String, unique=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
