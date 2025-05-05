from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import asyncio
from concurrent.futures import ThreadPoolExecutor
from .processMonitor import get_active_processes
from .malwareScanner import upload_to_virustotal, fetch_vt_report

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

@app.get("/processes")
def read_processes():
    return {"processes": get_active_processes()}

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


