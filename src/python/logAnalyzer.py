import win32evtlog

def analyze_logs():
    server = 'localhost'
    log_type = 'Security'
    hand = win32evtlog.OpenEventLog(server, log_type)
    total = win32evtlog.GetNumberOfEventLogRecords(hand)

    logs = []
    flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
    events = win32evtlog.ReadEventLog(hand, flags, 0)

    # Clean, descriptive event names
    event_descriptions = {
        4624: "Account successfully logged in",
        4625: "Failed login attempt",
        4634: "Account logged off",
        4672: "Special privileges assigned to new logon",
        4688: "New process created",
        4720: "New user account created",
        4722: "User account enabled",
        4725: "User account disabled",
        4726: "User account deleted",
        4732: "User added to a security-enabled local group",
        4768: "Kerberos authentication ticket requested",
        4769: "Kerberos service ticket requested",
        4771: "Kerberos pre-authentication failed",
    }

    severity_map = {
        win32evtlog.EVENTLOG_INFORMATION_TYPE: "Low",
        win32evtlog.EVENTLOG_WARNING_TYPE: "Medium",
        win32evtlog.EVENTLOG_ERROR_TYPE: "High"
    }

    if events:
        for event in events[:100]:
            event_id = event.EventID
            source = event.SourceName
            severity = severity_map.get(event.EventType, "Unknown")
            description = event_descriptions.get(event_id, f"Security event ({event_id})")

            suspicious = event_id in [4625, 4672, 4720, 4726, 4771]

            logs.append({
                "timestamp": str(event.TimeGenerated),
                "event_id": event_id,
                "type": description,
                "source": source,
                "computer": event.ComputerName,
                "message": description,
                "severity": severity,
                "suspicious": suspicious
            })

    return logs
