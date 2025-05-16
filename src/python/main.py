from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Request, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import asyncio
from concurrent.futures import ThreadPoolExecutor

# imports
from functions.processMonitor import get_active_processes, kill_process
from functions.malwareScanner import upload_to_virustotal, fetch_vt_report
from functions.portScanner import get_open_ports, close_port_by_pid
from functions.healthCheck import router as health_router
from functions.firewallManager import (
    get_firewall_rules,
    create_firewall_rule,
    delete_firewall_rule,
    update_firewall_rule
)
from functions.networkScanner import get_all_subnets, run_nmap_scan
from functions.logAnalyzer import analyze_logs

from db.database import engine
from db.models import Base
from agent_routes import router as agent_router
from functions.latestThreats import router as latest_threats_router
from functions.networkTraffic import get_network_traffic_snapshot
from functions.rogueScanner import scan_rogue_devices, trust_device, untrust_device


#  App setup
app = FastAPI()
executor = ThreadPoolExecutor()

# Create DB tables and include agent routes
Base.metadata.create_all(bind=engine)
app.include_router(agent_router)
app.include_router(health_router)
app.include_router(latest_threats_router)
# Allow React frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Process Monitor ===
@app.get("/processes")
def list_processes():
    return get_active_processes()

class KillRequest(BaseModel):
    pid: int

@app.post("/kill-process", status_code=status.HTTP_200_OK)
def kill_process_api(request: KillRequest):
    print(f"[KILL] Attempting to terminate PID {request.pid}")
    result = kill_process(request.pid)

    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

# === Malware Scanner ===
@app.post("/scan-malware")
async def scan_malware(file: UploadFile = File(...)):
    if not file:
        return {"status": "error", "message": "No file received"}

    os.makedirs("temp_uploads", exist_ok=True)
    temp_path = f"temp_uploads/{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    upload_result = upload_to_virustotal(temp_path)
    os.remove(temp_path)

    if upload_result["status"] != "uploaded":
        return upload_result

    report = fetch_vt_report(upload_result["analysis_id"])
    return report

# === Port Scanner ===
class KillPortRequest(BaseModel):
    pid: int

@app.get("/open-ports")
def list_open_ports():
    return {"ports": get_open_ports()}

@app.post("/close-port")
def close_port(req: KillPortRequest):
    result = close_port_by_pid(req.pid)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

# === Firewall Manager ===
@app.get("/firewall-rules")
def list_rules():
    return {"rules": get_firewall_rules()}

@app.post("/firewall-rules")
def create_rule(
    name: str = Body(...),
    direction: str = Body(...),
    action: str = Body(...),
    protocol: str = Body(...),
    localport: str = Body(...)
):
    return create_firewall_rule(name, direction, action, protocol, localport)

@app.put("/firewall-rules")
def update_rule(
    name: str = Body(...),
    new_action: str = Body(None),
    new_enabled: bool = Body(None)
):
    return update_firewall_rule(name, new_action, new_enabled)

@app.delete("/firewall-rules")
def delete_rule(name: str = Body(...)):
    return delete_firewall_rule(name)

# === Network Scan ===
@app.get("/network-scan/subnet")
def get_subnets():
    return {"subnets": get_all_subnets()}

@app.post("/network-scan")
async def scan_network(request: Request):
    body = await request.json()
    subnet = body.get("subnet")
    scan_type = body.get("scan_type")
    results = run_nmap_scan(scan_type, subnet)
    return results

# === Log Analysis ===
@app.get("/logs")
def read_logs():
    logs = analyze_logs()
    return { "logs": logs }

@app.get("/network-traffic")
def get_traffic():
    return {"traffic": get_network_traffic_snapshot()}

class DeviceTrustRequest(BaseModel):
    mac: str
    vendor: str

@app.get("/rogue-devices")
def get_rogue_devices(subnet: str = Query(..., description="Subnet to scan, e.g., 192.168.1.0/24")):
    return scan_rogue_devices(subnet)

@app.post("/trust-device")
def api_trust_device(req: DeviceTrustRequest):
    return trust_device(req.mac, req.vendor)

@app.post("/untrust-device")
def api_untrust_device(req: DeviceTrustRequest):
    return untrust_device(req.mac, req.vendor)