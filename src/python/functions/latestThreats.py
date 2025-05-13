import os
import httpx
from fastapi import APIRouter
from datetime import datetime
from dotenv import load_dotenv

router = APIRouter()
load_dotenv()

@router.get("/threat-intel/latest")
async def get_latest_threats():
    threats = []

    # 1. Fetch from CISA KEV
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json")
            kev_data = response.json()["vulnerabilities"][:10] 

            for item in kev_data:
                threats.append({
                    "title": item.get("cveID", "Unknown CVE"),
                    "category": "Vulnerability Exploit",
                    "description": item.get("notes", "No description available"),
                    "ttp": ["T1190"],  # TTP for Exploit Public-Facing Application
                    "mitigation": [
                        f"Apply patch before {item.get('dueDate', 'ASAP')}",
                        "Restrict external access to vulnerable services"
                    ],
                    "date": item.get("dateAdded", str(datetime.now().date())),
                    "source": "CISA KEV"
                })
    except Exception as e:
        print(f"CISA fetch failed: {e}")

    # 2. Fetch from AlienVault OTX (top pulses)
    try:
        headers = {"X-OTX-API-KEY": "7d908f3faa39100c7830cef5de646e9be9924cca86d2484e49ba2f9c229bfc4c"}
        async with httpx.AsyncClient() as client:
            response = await client.get("https://otx.alienvault.com/api/v1/pulses/subscribed", headers=headers)
            otx_data = response.json().get("results", [])[:10]

            for pulse in otx_data:
                threats.append({
                    "title": pulse.get("name", "Unnamed Threat"),
                    "category": "Threat Pulse",
                    "description": pulse.get("description", "No details"),
                    "ttp": [tag for tag in pulse.get("tags", []) if tag.startswith("T")],  # extract MITRE tags
                    "mitigation": ["Refer to attached indicators & block malicious IPs/domains"],
                    "date": pulse.get("created", str(datetime.now().date())),
                    "source": "AlienVault OTX"
                })
    except Exception as e:
        print(f"OTX fetch failed: {e}")

    return threats
