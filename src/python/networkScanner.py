import nmap
import socket
import psutil

def get_all_subnets():
    subnets = []
    interfaces = psutil.net_if_addrs()
    for iface, addrs in interfaces.items():
        for addr in addrs:
            if addr.family == socket.AF_INET and not addr.address.startswith("169.254"):
                ip = addr.address
                mask = addr.netmask
                if ip and mask:
                    subnet = f"{ip.rsplit('.', 1)[0]}.0/24"
                    if subnet not in subnets:
                        subnets.append(subnet)
    return subnets

def run_nmap_scan(scan_type: str, subnet: str):
    nm = nmap.PortScanner()

    scan_options = {
        "Quick Scan": "-T4 -F",
        "Ping Sweep": "-sn",
        "Service Detection": "-sV",
        "OS Detection": "-O",
        "Aggressive Scan": "-A"
    }

    args = scan_options.get(scan_type, "-T4 -F")
    try:
        nm.scan(hosts=subnet, arguments=args)
        results = {}
        for host in nm.all_hosts():
            results[host] = {
                "hostname": nm[host].hostname(),
                "state": nm[host].state(),
                "tcp": nm[host].get("tcp", {}),
                "os": nm[host].get("osmatch", [])
            }
        return results
    except Exception as e:
        return {"error": str(e)}
