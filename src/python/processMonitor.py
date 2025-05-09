import psutil
import threading
import re

SAFE_PATH_KEYWORDS = [
    "windows\\system32",
    "program files",
    "program files (x86)"
]

WHITELIST_NAMES = {
    "system", "idle", "system idle process", "svchost.exe", "wininit.exe",
    "csrss.exe", "winlogon.exe", "services.exe", "lsass.exe", "explorer.exe"
}

SUSPICIOUS_NAMES = {"tmp.exe", "update.exe", "updater.exe"}
SUSPICIOUS_NAME_PATTERN = re.compile(r"^[a-z]{1,2}\d{2,}\.exe$", re.IGNORECASE)
SUSPICIOUS_CHILD_PROCESSES = {
    "cmd.exe", "powershell.exe", "pwsh.exe", "wscript.exe", "cscript.exe",
    "mshta.exe", "rundll32.exe", "regsvr32.exe", "schtasks.exe"
}
OFFICE_PARENTS = {
    "winword.exe", "excel.exe", "powerpnt.exe", "outlook.exe",
    "mspub.exe", "visio.exe"
}

CPU_USAGE_THRESHOLD = 25.0
MEMORY_USAGE_THRESHOLD_MB = 150

def is_path_suspicious(path: str) -> bool:
    lower_path = path.lower()
    return not any(safe in lower_path for safe in SAFE_PATH_KEYWORDS)

def get_active_processes():
    processes = []

    def collect(proc):
        try:
            info = proc.as_dict(attrs=['pid', 'name', 'username', 'cpu_percent', 'memory_info', 'exe', 'ppid'])
            path = info.get("exe") or ""
            name = (info.get("name") or "").strip().lower()
            cpu = info.get("cpu_percent", 0.0)
            mem = info.get("memory_info").rss / (1024 * 1024)
            user = info.get("username", "N/A")
            ppid = info.get("ppid", 0)

            # Skip system-owned processes
            if user.lower().startswith("nt authority\\system"):
                return

            suspicious = False
            reasons = []

            # Whitelist system processes in expected paths
            if name in WHITELIST_NAMES:
                if any(safe in path.lower() for safe in SAFE_PATH_KEYWORDS):
                    processes.append({
                        "pid": info['pid'],
                        "name": info['name'],
                        "user": user,
                        "cpu": round(cpu, 2),
                        "memory": round(mem, 2),
                        "path": path,
                        "suspicious": False,
                        "suspicious_reasons": []
                    })
                    return

            # Masquerading check
            if name in WHITELIST_NAMES and is_path_suspicious(path):
                suspicious = True
                reasons.append("Masquerading: system name in non-system path")

            if "\\temp" in path.lower() or "\\users\\" in path.lower():
                suspicious = True
                reasons.append("Executed from temp or user directory")

            if name in SUSPICIOUS_NAMES or SUSPICIOUS_NAME_PATTERN.match(name):
                suspicious = True
                reasons.append("Suspicious process name")

            if cpu > CPU_USAGE_THRESHOLD:
                suspicious = True
                reasons.append(f"High CPU usage ({cpu:.1f}%)")

            if mem > MEMORY_USAGE_THRESHOLD_MB:
                suspicious = True
                reasons.append(f"High memory usage ({mem:.1f} MB)")

            try:
                parent_name = psutil.Process(ppid).name().lower()
                if parent_name in OFFICE_PARENTS and name in SUSPICIOUS_CHILD_PROCESSES:
                    suspicious = True
                    reasons.append(f"Office process launched suspicious child: {parent_name} -> {name}")
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

            processes.append({
                "pid": info['pid'],
                "name": info['name'],
                "user": user,
                "cpu": round(cpu, 2),
                "memory": round(mem, 2),
                "path": path,
                "suspicious": suspicious,
                "suspicious_reasons": reasons
            })

        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    threads = []
    for proc in psutil.process_iter():
        t = threading.Thread(target=collect, args=(proc,))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    return processes

def kill_process(pid: int) -> dict:
    try:
        p = psutil.Process(pid)
        p.terminate()
        p.wait(timeout=3)
        return {"status": "success", "message": f"Process {pid} terminated."}
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.TimeoutExpired) as e:
        return {"status": "error", "message": str(e)}
