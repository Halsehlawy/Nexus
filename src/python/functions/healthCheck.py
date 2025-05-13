import subprocess
import json
import winreg
import wmi
from fastapi import APIRouter

router = APIRouter()

def check_defender():
    try:
        output = subprocess.check_output(
            r'powershell -Command "Get-MpComputerStatus | ConvertTo-Json -Compress"',
            shell=True
        )
        data = json.loads(output)
        if data.get("RealTimeProtectionEnabled") and data.get("AMServiceEnabled"):
            return {"key": "defender", "status": "healthy", "message": "Microsoft Defender is running"}
    except Exception as e:
        print("Defender check failed:", e)
    return {"key": "defender", "status": "unhealthy", "message": "Microsoft Defender is not active"}

def check_firewall():
    try:
        output = subprocess.check_output(
            r'powershell -Command "(Get-NetFirewallProfile | Select-Object -ExpandProperty Enabled) -contains $false"',
            shell=True
        )
        if output.decode().strip().lower() == "true":
            return {"key": "firewall", "status": "unhealthy", "message": "Firewall is off on some profiles"}
        return {"key": "firewall", "status": "healthy", "message": "Firewall is enabled on all profiles"}
    except Exception as e:
        print("Firewall check failed:", e)
        return {"key": "firewall", "status": "unhealthy", "message": "Unable to verify firewall status"}

def check_guest_account():
    try:
        output = subprocess.check_output("net user guest", shell=True).decode().lower()
        if "account active               no" in output:
            return {"key": "guest", "status": "healthy", "message": "Guest account is disabled"}
        return {"key": "guest", "status": "unhealthy", "message": "Guest account is enabled"}
    except Exception as e:
        print("Guest account check failed:", e)
        return {"key": "guest", "status": "unhealthy", "message": "Unable to determine guest account status"}

def check_bitlocker():
    try:
        output = subprocess.check_output(
            r'powershell -Command "Get-BitLockerVolume -MountPoint ''C:'' | ConvertTo-Json -Compress"',
            shell=True
        )
        data = json.loads(output)
        if isinstance(data, list):
            data = data[0]
        if data.get("VolumeStatus") == "FullyEncrypted":
            return {"key": "bitlocker", "status": "healthy", "message": "BitLocker is enabled and drive is encrypted"}
    except Exception as e:
        print("BitLocker check failed:", e)
    return {"key": "bitlocker", "status": "unhealthy", "message": "BitLocker is not enabled or drive is not encrypted"}

def check_windows_update():
    try:
        w = wmi.WMI(namespace='root\\cimv2')
        updates = sorted(
            (u.InstalledOn for u in w.Win32_QuickFixEngineering() if u.InstalledOn),
            reverse=True
        )
        if updates:
            return {"key": "windows_update", "status": "healthy", "message": f"Latest update installed on {updates[0]}"}
    except Exception as e:
        print("Windows update check failed:", e)
    return {
        "key": "windows_update",
        "status": "unhealthy",
        "message": "Windows has not installed recent updates"
    }

def check_rdp_encryption():
    try:
        key_path = r"SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp"
        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, key_path) as key:
            value, _ = winreg.QueryValueEx(key, "UserAuthentication")
            if value == 1:
                return {"key": "rdp", "status": "healthy", "message": "RDP Network Level Authentication (NLA) is enabled"}
    except Exception as e:
        print("RDP encryption check failed:", e)
    return {"key": "rdp", "status": "unhealthy", "message": "RDP does not enforce Network Level Authentication"}

@router.get("/health-check")
def health_check():
    checks = [
        check_defender(),
        check_firewall(),
        check_guest_account(),
        check_bitlocker(),
        check_windows_update(),
        check_rdp_encryption(),
    ]
    return {"status": "ok", "checks": checks}
