import subprocess
import json
def get_firewall_rules():
    try:
        result = subprocess.check_output(
            ['powershell', '-Command', '''
                Get-NetFirewallRule | ForEach-Object {
                    [PSCustomObject]@{
                        Name = $_.Name
                        DisplayName = $_.DisplayName
                        Direction = $_.Direction.ToString()
                        Enabled = $_.Enabled.ToString()
                        Action = $_.Action.ToString()
                        Profile = $_.Profile.ToString()
                    }
                } | ConvertTo-Json
            '''],
            stderr=subprocess.DEVNULL,
            creationflags=0x08000000
        ).decode(errors='ignore')

        return json.loads(result)
    except Exception as e:
        return {"error": str(e)}


def create_firewall_rule(name, direction, action, protocol, localport):
    try:
        cmd = [
            'powershell', '-Command',
            f"New-NetFirewallRule -DisplayName '{name}' -Direction {direction} -Action {action} "
            f"-Protocol {protocol} -LocalPort {localport} -Enabled True"
        ]
        subprocess.run(cmd, check=True, stderr=subprocess.DEVNULL, creationflags=0x08000000)
        return {"status": "success", "message": f"Rule '{name}' created."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def delete_firewall_rule(name):
    try:
        cmd = ['powershell', '-Command', f"Remove-NetFirewallRule -DisplayName '{name}'"]
        subprocess.run(cmd, check=True, stderr=subprocess.DEVNULL, creationflags=0x08000000)
        return {"status": "success", "message": f"Rule '{name}' deleted."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def update_firewall_rule(name, new_action=None, new_enabled=None):
    try:
        cmd_parts = [f"Set-NetFirewallRule -DisplayName '{name}'"]
        if new_action:
            cmd_parts.append(f"-Action {new_action}")
        if new_enabled is not None:
            enabled_str = "True" if new_enabled else "False"
            cmd_parts.append(f"-Enabled {enabled_str}")
        cmd = ['powershell', '-Command', ' '.join(cmd_parts)]
        subprocess.run(cmd, check=True, stderr=subprocess.DEVNULL, creationflags=0x08000000)
        return {"status": "success", "message": f"Rule '{name}' updated."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}
