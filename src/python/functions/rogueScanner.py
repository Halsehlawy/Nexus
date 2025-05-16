import subprocess
import re
import json
import os
import threading
import socket
import psutil

TRUSTED_DEVICES_FILE = "trusted_devices.json"
scan_lock = threading.Lock()

def get_all_subnets():
    subnets = []
    interfaces = psutil.net_if_addrs()
    for iface, addrs in interfaces.items():
        for addr in addrs:
            if addr.family == socket.AF_INET and not addr.address.startswith("169.254"):
                ip = addr.address
                subnet = f"{ip.rsplit('.', 1)[0]}.0/24"
                if subnet not in subnets:
                    subnets.append(subnet)
    return subnets

def load_trusted_devices():
    if not os.path.exists(TRUSTED_DEVICES_FILE):
        with open(TRUSTED_DEVICES_FILE, "w") as f:
            json.dump([], f)
    with open(TRUSTED_DEVICES_FILE, "r") as f:
        return json.load(f)

def save_trusted_devices(data):
    with open(TRUSTED_DEVICES_FILE, "w") as f:
        json.dump(data, f, indent=2)

def trust_device(mac: str, vendor: str):
    mac = mac.lower()
    vendor = vendor.strip()
    trusted = load_trusted_devices()
    if not any(d["mac"] == mac and d["vendor"] == vendor for d in trusted):
        trusted.append({"mac": mac, "vendor": vendor})
        save_trusted_devices(trusted)
    return {"status": "trusted", "mac": mac, "vendor": vendor}

def untrust_device(mac: str, vendor: str):
    mac = mac.lower()
    vendor = vendor.strip()
    trusted = load_trusted_devices()
    trusted = [d for d in trusted if not (d["mac"] == mac and d["vendor"] == vendor)]
    save_trusted_devices(trusted)
    return {"status": "untrusted", "mac": mac, "vendor": vendor}

def scan_rogue_devices(subnet: str):
    with scan_lock:
        try:
            output = subprocess.check_output(
                ["nmap", "-sn", "--system-dns", subnet],
                stderr=subprocess.DEVNULL,
                text=True
            )
        except Exception as e:
            return {"error": f"Nmap scan failed: {e}"}

        trusted = load_trusted_devices()
        devices = []
        current = {}

        for line in output.splitlines():
            if line.startswith("Nmap scan report for"):
                if current:
                    # Fallbacks
                    current["mac"] = current.get("mac", "00:00:00:00:00:00").lower()
                    current["vendor"] = current.get("vendor", "Unknown").strip()
                    current["status"] = "Trusted" if any(
                        t["mac"] == current["mac"] and t["vendor"] == current["vendor"]
                        for t in trusted
                    ) else "Untrusted"
                    devices.append(current)
                    current = {}

                ip_match = re.search(r"Nmap scan report for (.+)", line)
                if ip_match:
                    current["ip"] = ip_match.group(1)
                    current["hostname"] = ip_match.group(1).split(" ")[0]

            elif "MAC Address:" in line:
                mac_match = re.search(r"MAC Address: ([0-9A-F:]+) \((.*)\)", line)
                if mac_match:
                    current["mac"] = mac_match.group(1)
                    current["vendor"] = mac_match.group(2)

        if current:
            current["mac"] = current.get("mac", "00:00:00:00:00:00").lower()
            current["vendor"] = current.get("vendor", "Unknown").strip()
            current["status"] = "Trusted" if any(
                t["mac"] == current["mac"] and t["vendor"] == current["vendor"]
                for t in trusted
            ) else "Untrusted"
            devices.append(current)

        return {"devices": devices}