import win32evtlog

LOGON_TYPES = {
    "2": "Interactive",
    "3": "Network",
    "4": "Batch",
    "5": "Service",
    "7": "Unlock",
    "8": "Cleartext",
    "9": "RunAs (NewCredentials)",
    "10": "Remote (RDP)",
    "11": "CachedInteractive"
}

def analyze_logs():
    server = 'localhost'
    log_type = 'Security'
    hand = win32evtlog.OpenEventLog(server, log_type)
    logs = []
    flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
    read_count = 0
    max_logs = 100

    event_descriptions = {
        4624: "Successful logon",
        4625: "Failed logon",
        4672: "Privileged logon",
        4688: "New process created",
        4720: "User account created"
    }

    severity_map = {
        1: "High",   # Error
        2: "Medium", # Warning
        4: "Low",    # Info
        8: "Low",    # Audit Success
        16: "High"   # Audit Failure
    }

    while read_count < max_logs:
        events = win32evtlog.ReadEventLog(hand, flags, 0)
        if not events:
            break

        for event in events:
            if read_count >= max_logs:
                break

            event_id = event.EventID & 0xFFFF
            inserts = event.StringInserts or []
            extra = {}
            message = event_descriptions.get(event_id, f"Security event ({event_id})")

            if event_id == 4625 and len(inserts) >= 19:
                raw_user = inserts[5] or "-"
                raw_logon_type = inserts[8] or "-"
                raw_source_ip = inserts[18] if len(inserts) > 18 else "N/A"

                username = raw_user if raw_user not in ["-", ""] else "SYSTEM or background process"
                logon_type = LOGON_TYPES.get(raw_logon_type, f"Type {raw_logon_type}" if not raw_logon_type.startswith("%%") else "Unknown")
                source_ip = raw_source_ip if raw_source_ip and "." in raw_source_ip else "N/A"

                extra = {
                    "username": username,
                    "logon_type": logon_type,
                    "workstation": inserts[10] if len(inserts) > 10 else "-",
                    "failure_reason": inserts[11] if len(inserts) > 11 else "-",
                    "source_ip": source_ip
                }

                message = (
                    "❌ Failed system-level login (no username or IP)"
                    if username == "SYSTEM or background process" or source_ip == "N/A"
                    else f"❌ Failed login for {username} from {source_ip} ({logon_type})"
                )

            elif event_id == 4624 and len(inserts) >= 18:
                logon_code = inserts[8]
                logon_type = LOGON_TYPES.get(logon_code, f"Type {logon_code}")
                extra = {
                    "username": inserts[5],
                    "logon_type": logon_type,
                    "source_ip": inserts[18],
                    "workstation": inserts[11]
                }
                message = f"✅ Successful login for {inserts[5]} from {inserts[18]} ({logon_type})"

            elif event_id == 4688 and len(inserts) >= 6:
                extra = {
                    "creator": inserts[1],
                    "parent_process": inserts[3],
                    "new_process": inserts[5],
                    "command_line": inserts[6] if len(inserts) > 6 else "-"
                }
                message = f"⚙️ New process started: {inserts[5]}"

            elif event_id == 4720 and len(inserts) >= 1:
                extra = {
                    "new_account": inserts[0]
                }
                message = f"👤 New user account created: {inserts[0]}"

            elif event_id == 4672 and len(inserts) >= 1:
                extra = {
                    "username": inserts[1] if len(inserts) > 1 else "Unknown"
                }
                message = f"🔒 Privileged logon by {extra['username']}"

            logs.append({
                "timestamp": str(event.TimeGenerated),
                "event_id": event_id,
                "type": event_descriptions.get(event_id, "Security Event"),
                "source": event.SourceName,
                "computer": event.ComputerName,
                "message": message,
                "severity": severity_map.get(event.EventType, "Unknown"),
                "suspicious": (
                event_id == 4625 or
                event_id == 4720 or
                event_id == 4688 or
                (event_id == 4672 and extra.get("username", "").upper() not in ["SYSTEM", "LOCAL SERVICE", "NETWORK SERVICE"])
                    ),

                "details": extra
            })

            read_count += 1

    return logs
