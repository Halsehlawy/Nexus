from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime, timezone
from .database import Base

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)

class Agent(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String)
    mac_address = Column(String)
    os = Column(String)
    status = Column(String)
    last_seen = Column(DateTime, default=datetime.now(timezone.utc))
    department = Column(String, nullable=True)

