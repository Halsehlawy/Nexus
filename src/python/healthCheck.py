import subprocess
import winreg
import psutil
import os
import threading

def check_defender_status():
    try:
        result = subprocess.check_output(
            ['powershell', '-Command', 'Get-MpComputerStatus | Select -ExpandProperty RealTimeProtectionEnabled'],
            stderr=subprocess.DEVNULL,
            creationflags=0x08000000
        ).decode().strip()
        return result == 'True'
    except:
        return False

def check_firewall_status():
    try:
        result = subprocess.check_output(
            ['powershell', '-Command', 'Get-NetFirewallProfile | Select -ExpandProperty Enabled'],
            stderr=subprocess.DEVNULL,
            creationflags=0x08000000
        ).decode().splitlines()
        return all(line.strip() == 'True' for line in result if line.strip())
    except:
        return False

def check_guest_account_enabled():
    try:
        result = subprocess.check_output(
            ['net', 'user', 'Guest'],
            stderr=subprocess.DEVNULL,
            creationflags=0x08000000
        ).decode()
        return "Account active               Yes" in result
    except:
        return False

def check_pending_updates():
    try:
        result = subprocess.check_output(
            ['powershell', '-Command', '(New-Object -ComObject Microsoft.Update.Session).CreateUpdateSearcher().Search("IsInstalled=0").Updates.Count'],
            stderr=subprocess.DEVNULL,
            creationflags=0x08000000
        ).decode().strip()
        return int(result) == 0
    except:
        return False

def check_admin_accounts_with_no_password():
    try:
        result = subprocess.check_output(
            ['powershell', '-Command', 'Get-LocalUser | Where-Object { $_.Enabled -eq $true -and $_.PasswordRequired -eq $false -and $_.PrincipalSource -ne "Domain" } | Select -ExpandProperty Name'],
            stderr=subprocess.DEVNULL,
            creationflags=0x08000000
        ).decode().splitlines()
        return len([line for line in result if line.strip()]) == 0
    except:
        return False

def count_suspicious_autoruns():
    suspicious = 0
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\\Microsoft\\Windows\\CurrentVersion\\Run") as key:
            i = 0
            while True:
                try:
                    _, value, _ = winreg.EnumValue(key, i)
                    if any(s in value.lower() for s in ["temp", "appdata"]) or (value.lower().endswith(".exe") and not os.path.exists(value)):
                        suspicious += 1
                    i += 1
                except OSError:
                    break
    except:
        pass
    return suspicious

def run_all_checks():
    results = {}

    def run_and_store(key, func):
        try:
            results[key] = func()
        except:
            results[key] = False

    threads = [
        threading.Thread(target=run_and_store, args=("windows_defender", check_defender_status)),
        threading.Thread(target=run_and_store, args=("firewall", check_firewall_status)),
        threading.Thread(target=run_and_store, args=("guest_account", lambda: not check_guest_account_enabled())),
        threading.Thread(target=run_and_store, args=("windows_update", check_pending_updates)),
        threading.Thread(target=run_and_store, args=("admin_no_password", check_admin_accounts_with_no_password)),
        threading.Thread(target=run_and_store, args=("suspicious_autoruns", count_suspicious_autoruns)),
    ]

    for t in threads:
        t.start()
    for t in threads:
        t.join()

    return results

