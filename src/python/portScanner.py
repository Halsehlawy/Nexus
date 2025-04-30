import socket
import threading
from queue import Queue

# Configuration
target = "127.0.0.1"
start_port = 1
end_port = 1024
thread_count = 100

# Thread-safe queue
port_queue = Queue()
open_ports = []

def scan_port():
    while not port_queue.empty():
        port = port_queue.get()
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.3)
            result = s.connect_ex((target, port))
            if result == 0:
                try:
                    service = socket.getservbyport(port)
                except:
                    service = "Unknown"
                print(f"[OPEN] Port {port} ({service})")
                open_ports.append((port, service))
        port_queue.task_done()

# Fill the queue
for port in range(start_port, end_port + 1):
    port_queue.put(port)

# Start threads
threads = []
for _ in range(thread_count):
    t = threading.Thread(target=scan_port)
    t.start()
    threads.append(t)

# Wait for all threads to finish
for t in threads:
    t.join()

# Summary
print(f"\nScan complete. Open ports: {len(open_ports)}")
