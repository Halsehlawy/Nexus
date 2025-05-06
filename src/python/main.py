from fastapi import FastAPI, UploadFile, File, HTTPException,Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import asyncio
from concurrent.futures import ThreadPoolExecutor
from .processMonitor import get_active_processes
from .malwareScanner import upload_to_virustotal, fetch_vt_report
from .portScanner import get_open_ports, close_port_by_pid
from .startupManager import get_startup_programs, disable_startup_program
from .healthCheck import run_all_checks
from .firewallManager import (
    get_firewall_rules,
    create_firewall_rule,
    delete_firewall_rule,
    update_firewall_rule
)
from .networkScanner import get_all_subnets, run_nmap_scan


app = FastAPI()
executor = ThreadPoolExecutor()

# Allow React frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
## health check
@app.get("/health-checks")
def get_health_status():
    return run_all_checks()
## process monitor 
@app.get("/processes")
def read_processes():
    return {"processes": get_active_processes()}

class KillRequest(BaseModel):
    pid: int

@app.post("/kill-process")
def kill_process_api(request: KillRequest):
    from .processMonitor import kill_process
    result = kill_process(request.pid)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

## malware scanner
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

## port scanner
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

##startup manager
class DisableStartupRequest(BaseModel):
    name: str
    location: str  # "CurrentUser" or "LocalMachine"

@app.get("/startup-programs")
def list_startup_programs():
    return {"programs": get_startup_programs()}

@app.post("/disable-startup-program")
def disable_startup(req: DisableStartupRequest):
    result = disable_startup_program(req.name, req.location)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

## firewall manager
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

# === Network Scan Routes ===
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