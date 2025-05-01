import socket
import ipaddress
import psutil
from scapy.all import ARP, Ether, srp1
from concurrent.futures import ThreadPoolExecutor, as_completed
from manuf import manuf
import subprocess
import threading

discovered_devices = []
lock = threading.Lock()
parser = manuf.MacParser()

def get_all_ipv4_networks():
    networks = []
    for interface, snics in psutil.net_if_addrs().items():
        for snic in snics:
            if snic.family == socket.AF_INET and not snic.address.startswith("127."):
                ip = snic.address
                netmask = snic.netmask
                try:
                    net = ipaddress.IPv4Network(f"{ip}/{netmask}", strict=False)
                    if is_valid_network(net):
                        networks.append(str(net))
                except:
                    pass
    return list(set(networks))

def is_valid_network(net):
    return (
        not net.is_loopback and
        not net.is_link_local and
        net.prefixlen >= 24
    )

def scan_ip(ip):
    try:
        arp = ARP(pdst=str(ip))
        ether = Ether(dst="ff:ff:ff:ff:ff:ff")
        packet = ether / arp
        result = srp1(packet, timeout=1, verbose=False)
        if result:
            mac = result.hwsrc
            vendor = parser.get_manuf(mac) or "Unknown"

            # Optional: Try Nmap for OS detection
            os = detect_os(str(ip))

            with lock:
                discovered_devices.append({
                    'ip': result.psrc,
                    'mac': mac,
                    'vendor': vendor,
                    'os': os
                })
    except:
        pass

def detect_os(ip):
    try:
        # Call nmap with OS detection
        output = subprocess.check_output(["nmap", "-O", ip], stderr=subprocess.DEVNULL, timeout=5)
        lines = output.decode().splitlines()
        for line in lines:
            if "OS details:" in line:
                return line.strip().replace("OS details: ", "")
            elif "Running:" in line:
                return line.strip().replace("Running: ", "")
    except:
        return "Unknown"
    return "Unknown"

def scan_network(network_range):
    print(f"[+] Scanning: {network_range}")
    network = ipaddress.IPv4Network(network_range, strict=False)
    with ThreadPoolExecutor(max_workers=100) as executor:
        futures = [executor.submit(scan_ip, ip) for ip in network.hosts()]
        for future in as_completed(futures):
            pass

def display_devices(devices):
    print("\nDiscovered Devices:")
    print("IP Address\tMAC Address\t\tVendor\t\t\tOS")
    print("-" * 80)
    for d in devices:
        print(f"{d['ip']}\t{d['mac']}\t{d['vendor'][:20]:<20}\t{d['os'][:30]}")

if __name__ == "__main__":
    print("[*] Scanning all connected networks...")
    networks = get_all_ipv4_networks()

    if not networks:
        print("[-] No active networks found.")
    else:
        for net in networks:
            scan_network(net)

        if discovered_devices:
            display_devices(discovered_devices)
        else:
            print("[-] No devices found.")
