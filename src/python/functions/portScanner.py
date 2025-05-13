import psutil
import socket

def get_open_ports():
    open_ports = []
    connections = psutil.net_connections(kind='inet')

    for conn in connections:
        if conn.status == psutil.CONN_LISTEN and conn.laddr:
            port = conn.laddr.port
            proto = 'TCP' if conn.type == socket.SOCK_STREAM else 'UDP'
            pid = conn.pid
            process_name = "Unknown"
            service = None

            if pid:
                try:
                    process = psutil.Process(pid)
                    process_name = process.name()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    process_name = "Access Denied"

            try:
                service = socket.getservbyport(port)
            except:
                service = "Unknown"

            open_ports.append({
                "port": port,
                "protocol": proto,
                "service": service,
                "pid": pid,
                "process_name": process_name
            })

    return open_ports

def close_port_by_pid(pid: int):
    try:
        p = psutil.Process(pid)
        p.terminate()
        p.wait(timeout=3)
        return {"status": "success", "message": f"Process {pid} terminated to close port."}
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.TimeoutExpired) as e:
        return {"status": "error", "message": str(e)}
