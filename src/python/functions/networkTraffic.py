import psutil
import socket
import requests
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

SUSPICIOUS_PORTS = {23, 4444, 3389, 6667, 31337}
HIGH_RISK_COUNTRIES = {"RU", "CN", "KP", "IR"}

def get_ip_metadata(ip):
    try:
        response = requests.get(f"http://ip-api.com/json/{ip}?fields=status,country,isp,org", timeout=2)
        data = response.json()
        if data.get("status") == "success":
            return ip, {
                "country": data.get("country", "Unknown"),
                "isp": data.get("isp", "Unknown"),
                "org": data.get("org", "Unknown")
            }
    except:
        pass
    return ip, {"country": "Unknown", "isp": "Unknown", "org": "Unknown"}

def reverse_dns(ip):
    try:
        return ip, socket.getfqdn(ip)
    except:
        return ip, "-"

def get_network_traffic_snapshot():
    snapshot = []
    connections = psutil.net_connections(kind='inet')
    pid_map = defaultdict(list)
    ip_set = set()

    for conn in connections:
        if conn.raddr and conn.status != psutil.CONN_LISTEN:
            pid_map[conn.pid].append(conn)
            ip_set.add(conn.raddr.ip)

    ip_info_map = {}
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(get_ip_metadata, ip) for ip in ip_set]
        for f in as_completed(futures):
            ip, info = f.result()
            ip_info_map[ip] = info

    dns_map = {}
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(reverse_dns, ip) for ip in ip_set]
        for f in as_completed(futures):
            ip, hostname = f.result()
            dns_map[ip] = hostname

    for pid, conns in pid_map.items():
        try:
            proc = psutil.Process(pid)
            name = proc.name()
        except Exception:
            name = "Unknown"

        entry = {
            "pid": pid,
            "name": name,
            "connections": []
        }

        for conn in conns:
            laddr = f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "-"
            raddr_ip = conn.raddr.ip
            rport = conn.raddr.port
            raddr = f"{raddr_ip}:{rport}"
            status = conn.status

            info = ip_info_map.get(raddr_ip, {})
            host = dns_map.get(raddr_ip, "-")

            suspicious = (rport in SUSPICIOUS_PORTS) or (info.get("country") in HIGH_RISK_COUNTRIES)

            entry["connections"].append({
                "laddr": laddr,
                "raddr": raddr,
                "status": status,
                "remote_host": host,
                "country": info.get("country", "-"),
                "isp": info.get("isp", "-"),
                "org": info.get("org", "-"),
                "suspicious": suspicious
            })

        if entry["connections"]:
            snapshot.append(entry)

    snapshot.sort(key=lambda x: x["pid"])  # ✅ Sort by PID ascending
    return snapshot