import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { ArrowLeft, RefreshCcw, Check, X, Radar } from "lucide-react"
import "../../styles/networkSecurity.css"

interface Device {
  ip: string
  mac: string
  vendor: string
  hostname?: string
  status: "Trusted" | "Untrusted"
}

const RogueDevices = () => {
  const navigate = useNavigate()
  const [devices, setDevices] = useState<Device[]>([])
  const [subnets, setSubnets] = useState<string[]>([])
  const [selectedSubnet, setSelectedSubnet] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const loadSubnets = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/network-scan/subnet")
      const data = await res.json()
      setSubnets(data.subnets || [])
    } catch (err) {
      console.error("Failed to load subnets", err)
    }
  }

  const scanDevices = async () => {
    if (!selectedSubnet) return
    setLoading(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/rogue-devices?subnet=${selectedSubnet}`)
      const data = await res.json()
      setDevices(data.devices || [])
    } catch (err) {
      console.error("Scan failed", err)
    } finally {
      setLoading(false)
    }
  }

  const refreshDevices = () => scanDevices()

  const trustDevice = async (mac: string, vendor: string) => {
    await fetch("http://127.0.0.1:8000/trust-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mac, vendor }),
    })
    scanDevices()
  }

  const untrustDevice = async (mac: string, vendor: string) => {
    await fetch("http://127.0.0.1:8000/untrust-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mac, vendor }),
    })
    scanDevices()
  }

  useEffect(() => {
    loadSubnets()
  }, [])

  return (
    <Layout title="Rogue Device Detection">
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate("/network-security")}>
          <ArrowLeft size={16} style={{ marginRight: "6px" }} />
          Go Back
        </button>
      </div>

      <div className="traffic-header">
        <h3 className="traffic-title">Rogue Device Detection</h3>
      </div>

      <div className="scan-header">
        <div className="subnet-select-group">
          <label htmlFor="subnet-select">Select Subnet:</label>
          <select
            id="subnet-select"
            value={selectedSubnet}
            onChange={(e) => setSelectedSubnet(e.target.value)}
          >
            <option disabled value="">
              -- Choose Subnet --
            </option>
            {subnets.map((subnet, i) => (
              <option key={i} value={subnet}>
                {subnet}
              </option>
            ))}
          </select>
        </div>

        <div className="scan-controls">
          <button className="log-toggle-button" onClick={scanDevices} disabled={!selectedSubnet}>
            <Radar size={14} style={{ marginRight: "6px" }} />
            {loading ? "Scanning..." : "Scan"}
          </button>
          <button className="log-toggle-button" onClick={refreshDevices} disabled={!selectedSubnet}>
            <RefreshCcw size={14} style={{ marginRight: "6px" }} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="log-loading-text">Scanning for devices on {selectedSubnet}...</p>
      ) : devices.length === 0 ? (
        <p className="log-loading-text">No devices found.</p>
      ) : (
        <div className="device-scroll-container">
          <div className="traffic-results">
            <table className="traffic-table">
              <thead>
                <tr>
                  <th>Hostname</th>
                  <th>IP Address</th>
                  <th>MAC</th>
                  <th>Vendor</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d, i) => (
                  <tr key={i} className={d.status === "Untrusted" ? "danger-row" : ""}>
                    <td>{d.hostname || "Unknown"}</td>
                    <td>{d.ip.match(/\((.*?)\)/)?.[1] || d.ip}</td>
                    <td>{d.mac}</td>
                    <td>{d.vendor}</td>
                    <td className={d.status === "Untrusted" ? "danger-text" : ""}>{d.status}</td>
                    <td>
                      {d.status === "Untrusted" ? (
                        <button
                          className="log-toggle-button"
                          onClick={() => trustDevice(d.mac, d.vendor)}
                        >
                          <Check size={14} style={{ marginRight: "4px" }} />
                          Trust
                        </button>
                      ) : (
                        <button
                          className="log-toggle-button"
                          onClick={() => untrustDevice(d.mac, d.vendor)}
                        >
                          <X size={14} style={{ marginRight: "4px" }} />
                          Untrust
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default RogueDevices
