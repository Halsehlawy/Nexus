# startupManager.py
import winreg
import os
import shlex

def get_startup_programs():
    startup_items = []

    def read_registry_key(root, path, location):
        try:
            with winreg.OpenKey(root, path) as key:
                i = 0
                while True:
                    try:
                        name, value, _ = winreg.EnumValue(key, i)
                        exe_path = extract_path(value)
                        suspicious = (
                            "temp" in exe_path.lower() or
                            "appdata" in exe_path.lower() or
                            exe_path.lower().endswith(".exe") and not os.path.exists(exe_path)
                        )
                        startup_items.append({
                            "name": name,
                            "path": value,
                            "basename": os.path.basename(exe_path),
                            "location": location,
                            "suspicious": suspicious
                        })
                        i += 1
                    except OSError:
                        break
        except FileNotFoundError:
            pass

    def extract_path(value):
        try:
            parts = shlex.split(value, posix=False)
            if parts:
                return parts[0]
        except:
            pass
        return value

    read_registry_key(winreg.HKEY_CURRENT_USER, r"Software\\Microsoft\\Windows\\CurrentVersion\\Run", "CurrentUser")
    read_registry_key(winreg.HKEY_LOCAL_MACHINE, r"Software\\Microsoft\\Windows\\CurrentVersion\\Run", "LocalMachine")

    return startup_items

def disable_startup_program(name, location):
    root = winreg.HKEY_CURRENT_USER if location == "CurrentUser" else winreg.HKEY_LOCAL_MACHINE
    path = r"Software\\Microsoft\\Windows\\CurrentVersion\\Run"
    try:
        with winreg.OpenKey(root, path, 0, winreg.KEY_SET_VALUE) as key:
            winreg.DeleteValue(key, name)
            return {"status": "success", "message": f"{name} has been removed from startup."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
