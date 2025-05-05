import psutil
import threading

SAFE_PATH_KEYWORDS = [
    "windows\\system32",
    "program files",
    "program files (x86)"
]

def is_path_suspicious(path: str) -> bool:
    lower_path = path.lower()
    return not any(safe in lower_path for safe in SAFE_PATH_KEYWORDS)

def get_active_processes():
    processes = []

    def collect(proc):
        try:
            info = proc.as_dict(attrs=['pid', 'name', 'username', 'cpu_percent', 'memory_info', 'exe'])
            path = info.get("exe") or ""
            suspicious = is_path_suspicious(path)
            processes.append({
                "pid": info['pid'],
                "name": info['name'],
                "user": info['username'],
                "cpu": info['cpu_percent'],
                "memory": round(info['memory_info'].rss / (1024 * 1024), 2),
                "path": path,
                "suspicious": suspicious
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
