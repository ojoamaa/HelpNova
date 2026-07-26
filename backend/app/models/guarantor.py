import json
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from app.core.database import Base


class Guarantor(Base):
    __tablename__ = "guarantors"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    worker_id = Column(String, nullable=False, index=True)
    token = Column(String, nullable=False, unique=True, index=True, default=lambda: str(uuid4()))

    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    relationship = Column(String, nullable=False)
    is_primary = Column(Boolean, nullable=False, default=False)

    status = Column(String, nullable=False, default="invitation_sent", index=True)
    date_of_birth = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    occupation = Column(String, nullable=True)
    employer = Column(String, nullable=True)
    work_address = Column(Text, nullable=True)
    years_known = Column(Integer, nullable=True)
    id_type = Column(String, nullable=True)
    id_number = Column(String, nullable=True)
    id_document_name = Column(String, nullable=True)
    address_proof_name = Column(String, nullable=True)
    declaration = Column(Boolean, nullable=False, default=False)
    signature = Column(String, nullable=True)

    review_note = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    audit_json = Column(Text, nullable=False, default="[]")

    def audit(self):
        try:
            return json.loads(self.audit_json or "[]")
        except json.JSONDecodeError:
            return []

    def append_audit(self, action: str, note: str | None = None):
        rows = self.audit()
        event = {"action": action, "at": datetime.utcnow().isoformat()}
        if note:
            event["note"] = note
        rows.append(event)
        self.audit_json = json.dumps(rows)
