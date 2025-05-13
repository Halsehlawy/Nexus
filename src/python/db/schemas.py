from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AdminLogin(BaseModel):
    username: str
    password: str

class AgentCreate(BaseModel):
    ip_address: str
    mac_address: str
    os: str
    status: str
    department: Optional[str] = None

class AgentUpdate(BaseModel):
    status: Optional[str]
    department: Optional[str]

class AgentOut(BaseModel):
    id: int
    ip_address: str
    mac_address: str
    os: str
    status: str
    last_seen: datetime
    department: Optional[str]


    class Config:
        orm_mode = True
