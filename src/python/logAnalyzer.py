import win32evtlog
import win32evtlogutil
import win32con

def get_recent_logs(limit=100, log_type="Security"):
    server = None  # Local machine
    flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
    events = []

    def parse_event(event):
        try:
            event_type = event.EventType
            event_id = event.EventID & 0xFFFF
            source = event.SourceName
            timestamp = event.TimeGenerated.Format()
            computer = event.ComputerName

            # Try normal formatting
            try:
                message = win32evtlogutil.SafeFormatMessage(event, source).strip()
            except Exception:
                inserts = event.StringInserts if event.StringInserts else []
                message = " | ".join([str(i) for i in inserts])

            # Add friendly label for common event IDs
            friendly_names = {
                4624: "✅ Successful Logon",
                4625: "❌ Failed Logon",
                4672: "🔒 Special Privileges Assigned",
                4688: "🛠️ New Process Created",
                4648: "🔐 Logon Using Explicit Credentials",
                5379: "🔑 Credential Validation",
            }
            event_name = friendly_names.get(event_id, "")

            return {
                "timestamp": timestamp,
                "event_id": event_id,
                "type": {
                    1: "Error",
                    2: "Warning",
                    4: "Information",
                    8: "Audit Success",
                    16: "Audit Failure"
                }.get(event_type, "Unknown"),
                "source": source,
                "computer": computer,
                "message": f"{event_name}\n{message}" if event_name else message
            }
        except Exception as e:
            return { "error": f"Parse error: {str(e)}" }

    try:
        log_handle = win32evtlog.OpenEventLog(server, log_type)
        total = 0

        while True:
            records = win32evtlog.ReadEventLog(log_handle, flags, 0)
            if not records:
                break

            for event in records:
                parsed = parse_event(event)
                if "error" not in parsed:
                    events.append(parsed)
                    total += 1
                if total >= limit:
                    break

            if total >= limit:
                break

        win32evtlog.CloseEventLog(log_handle)
        return events

    except Exception as e:
        return [{ "error": f"Log read error: {str(e)}" }]
