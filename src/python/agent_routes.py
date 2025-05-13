from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import db.schemas as schemas
import db.models as models
import db.auth as auth
from db.database import get_db
from datetime import datetime


router = APIRouter()

@router.post("/admin/login")
def login(credentials: schemas.AdminLogin, db: Session = Depends(get_db)):
    admin = auth.authenticate_admin(db, credentials.username, credentials.password)
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token({"sub": admin.username})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/agents", response_model=list[schemas.AgentOut])
def list_agents(db: Session = Depends(get_db)):
    return db.query(models.Agent).all()

@router.post("/agents", response_model=schemas.AgentOut)
def create_agent(agent: schemas.AgentCreate, db: Session = Depends(get_db)):
    new_agent = models.Agent(**agent.dict(), last_seen=datetime.utcnow())
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    return new_agent

@router.put("/agents/{agent_id}")
def update_agent(agent_id: int, updates: schemas.AgentUpdate, db: Session = Depends(get_db)):
    agent = db.query(models.Agent).filter(models.Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(agent, key, value)
    agent.last_seen = datetime.utcnow()
    db.commit()
    return {"msg": "Updated"}

@router.delete("/agents/{agent_id}")
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(models.Agent).filter(models.Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    db.delete(agent)
    db.commit()
    return {"msg": "Deleted"}
