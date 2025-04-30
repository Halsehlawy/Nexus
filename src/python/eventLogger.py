import win32evtlog

def fetch_event_logs(log_type="Security", server="localhost", max_events=20):
    print(f"\n[✓] Fetching '{log_type}' logs from: {server}")
    hand = win32evtlog.OpenEventLog(server, log_type)
    total = win32evtlog.GetNumberOfEventLogRecords(hand)
    print(f"Total entries: {total}\n")

    flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
    logs = []

    events = win32evtlog.ReadEventLog(hand, flags, 0)
    count = 0
    while events and count < max_events:
        for event in events:
            record = {
                "Event ID": event.EventID & 0xFFFF,  # Normalize ID
                "Source": str(event.SourceName),
                "Time Generated": str(event.TimeGenerated),
                "Category": event.EventCategory,
                "Type": event.EventType,
                "Message": str(event.StringInserts) if event.StringInserts else "N/A"
            }
            logs.append(record)
            count += 1
            if count >= max_events:
                break
        events = win32evtlog.ReadEventLog(hand, flags, 0)
    
    win32evtlog.CloseEventLog(hand)
    return logs

# Example usage
if __name__ == "__main__":
    entries = fetch_event_logs("Security", max_events=200)

    for log in entries:
        print("\n--- Event ---")
        for key, value in log.items():
            print(f"{key}: {value}")
