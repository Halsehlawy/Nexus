import win32evtlog
import re

LOGON_TYPES = {
    "2": "Interactive",
    "3": "Network",
    "4": "Batch",
    "5": "Service",
    "7": "Unlock",
    "8": "Cleartext",
    "9": "RunAs",
    "10": "Remote (RDP)",
    "11": "Cached"
}
# Common noisy events that can be safely ignored
OMIT_EVENT_IDS = {
    4798,  # Group membership enumeration
    5145,  # Share access attempt (very frequent)
    5156,  # Windows firewall allowed a connection
    5158,  # Filtering platform detected a connection
    5379,  # Credential Manager read
    5632,  # Handle to an object was requested
    4698,  # Scheduled task was created
    7036,  # Service state change (starts/stops)
    4662,   # Operation was performed on an object (frequent)
    5379, 5382,4797,4799,5381,5058,5059,5061,5062,5063,4634,4719
}


SYSTEM_ACCOUNTS = {"system", "local service", "network service", "anonymous logon"}


def is_system_account(user: str) -> bool:
    return user.strip().lower() in SYSTEM_ACCOUNTS


def safe_get(inserts, index, fallback="-"):
    try:
        val = inserts[index]
        return val if val and not val.startswith("%%") else fallback
    except IndexError:
        return fallback


def valid_ip(val):
    return re.match(r"^\d{1,3}(\.\d{1,3}){3}$", val or "") is not None


def parse_logon_event_4625(inserts):
    result = {}

    username = safe_get(inserts, 5)
    logon_code = safe_get(inserts, 8)
    logon_type = LOGON_TYPES.get(logon_code, f"Type {logon_code}" if logon_code else "Unknown")
    workstation = safe_get(inserts, 10)
    failure_code = safe_get(inserts, 11)
    ip_raw = safe_get(inserts, 18)
    source_ip = ip_raw if valid_ip(ip_raw) else "N/A"

    result.update({
        "username": username,
        "logon_type": logon_type,
        "workstation": workstation,
        "failure_reason": failure_code,
        "source_ip": source_ip
    })

    if username == "-" and source_ip == "N/A":
        result["__message"] = "❌ Failed system-level login (no username or IP)"
    elif username == "-":
        result["__message"] = f"❌ Failed login from {source_ip} (no username)"
    elif source_ip == "N/A":
        result["__message"] = f"❌ Failed login for {username} (no IP)"
    else:
        result["__message"] = f"❌ Failed login for {username} from {source_ip} ({logon_type})"

    return result


def parse_logon_event_4624(inserts):
    username = safe_get(inserts, 5)
    logon_code = safe_get(inserts, 8)
    logon_type = LOGON_TYPES.get(logon_code, f"Type {logon_code}")
    workstation = safe_get(inserts, 11)
    ip_raw = safe_get(inserts, 18)
    source_ip = ip_raw if valid_ip(ip_raw) else "N/A"

    return {
        "username": username,
        "logon_type": logon_type,
        "workstation": workstation,
        "source_ip": source_ip
    }


def analyze_logs():
    server = 'localhost'
    log_type = 'Security'
    hand = win32evtlog.OpenEventLog(server, log_type)
    logs = []
    flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
    read_count = 0
    max_logs = 150  # Adjusted to capture more activity

    event_descriptions = {
        4624: "Successful logon",
        4625: "Failed logon",
        4648: "Explicit credential usage",
        4672: "Privileged logon",
        4688: "New process created",
        4720: "User account created",
        4722: "Account enabled",
        4724: "Password reset",
        4726: "Account deleted",
        4738: "Account modified",
        4800: "Workstation locked",
        4801: "Workstation unlocked"
    }

    severity_map = {
        1: "High",
        2: "Medium",
        4: "Low",
        8: "Low",
        16: "High"
    }

    while read_count < max_logs:
        events = win32evtlog.ReadEventLog(hand, flags, 0)
        if not events:
            break

        for event in events:
            if read_count >= max_logs:
                break

            event_id = event.EventID & 0xFFFF
            if event_id in OMIT_EVENT_IDS:
                continue  # Skip noisy system events


            inserts = event.StringInserts or []
            extra = {}
            is_suspicious = False
            message = event_descriptions.get(event_id, f"Security event ({event_id})")

            if event_id == 4625:
                extra = parse_logon_event_4625(inserts)
                message = extra.pop("__message")
                is_suspicious = True

            elif event_id == 4624:
                extra = parse_logon_event_4624(inserts)
                if is_system_account(extra.get("username", "")):
                    continue
                message = f"✅ Successful login for {extra['username']} from {extra['source_ip']} ({extra['logon_type']})"

            elif event_id == 4648:
                username = safe_get(inserts, 5)
                extra = { "username": username }
                message = f"🔒 Explicit credentials used by {username}"
                is_suspicious = True

            elif event_id == 4672 and len(inserts) >= 2:
                user = safe_get(inserts, 1)
                if is_system_account(user):
                    continue
                extra = { "username": user }
                message = f"🔒 Privileged logon by {user}"
                is_suspicious = True

            elif event_id == 4688 and len(inserts) >= 6:
                proc = safe_get(inserts, 5).lower()
                extra = {
                    "creator": safe_get(inserts, 1),
                    "parent_process": safe_get(inserts, 3),
                    "new_process": safe_get(inserts, 5),
                    "command_line": safe_get(inserts, 6)
                }
                message = f"⚙️ Process started: {extra['new_process']}"
                if any(s in proc for s in ["powershell", "cmd.exe", "certutil", "wscript"]):
                    is_suspicious = True

            elif event_id == 4720:
                target = safe_get(inserts, 0)
                extra = { "new_account": target }
                message = f"👤 User account created: {target}"
                is_suspicious = True

            elif event_id in {4722, 4724, 4726, 4738}:
                target = safe_get(inserts, 0)
                extra = { "target_user": target }
                symbol = "⚠️" if event_id in {4722, 4738} else "🔥"
                message = f"{symbol} {event_descriptions[event_id]} for {target}"
                is_suspicious = event_id in {4724, 4726}

            elif event_id in {4800, 4801}:
                username = safe_get(inserts, 1)
                extra = { "username": username }
                symbol = "🔒" if event_id == 4800 else "🔓"
                message = f"{symbol} {event_descriptions[event_id]} by {username}"

            logs.append({
                "timestamp": str(event.TimeGenerated),
                "event_id": event_id,
                "type": event_descriptions.get(event_id, "Security Event"),
                "source": event.SourceName,
                "computer": event.ComputerName,
                "message": message,
                "severity": severity_map.get(event.EventType, "Low"),
                "suspicious": is_suspicious,
                "details": extra
            })

            read_count += 1

    return logs
