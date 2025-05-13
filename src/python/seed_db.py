from db.models import Admin, Agent
from db.database import SessionLocal
from db.auth import get_password_hash
from datetime import datetime, timezone

db = SessionLocal()

# === Insert Admin ===
existing_admin = db.query(Admin).filter(Admin.username == "admin").first()


# === Insert Agents ===
agents = [
    Agent(ip_address="192.168.1.10", mac_address="AA:BB:CC:DD:EE:01", os="Windows", status="Online", last_seen=datetime.now(timezone.utc), department="IT"),
    Agent(ip_address="192.168.1.11", mac_address="AA:BB:CC:DD:EE:02", os="Linux", status="Offline", last_seen=datetime.now(timezone.utc), department="DevOps"),
    Agent(ip_address="192.168.1.12", mac_address="AA:BB:CC:DD:EE:03", os="macOS", status="Online", last_seen=datetime.now(timezone.utc), department="Finance"),
    Agent(ip_address="192.168.1.13", mac_address="AA:BB:CC:DD:EE:04", os="Windows", status="Offline", last_seen=datetime.now(timezone.utc), department="HR"),
    Agent(ip_address="192.168.1.14", mac_address="AA:BB:CC:DD:EE:05", os="Linux", status="Online", last_seen=datetime.now(timezone.utc), department="Security"),
]

db.add_all(agents)
db.commit()
print("✅ 5 agents inserted.")

db.close()
