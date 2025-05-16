import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { ArrowLeft, ChevronDown, ChevronUp, RefreshCcw } from "lucide-react"
import "../../styles/NetworkSecurity.css"

type Connection = {
  laddr: string
  raddr: string
  status: string
  remote_host: string
  country: string
  isp: string
  org: string
  suspicious: boolean
}

type TrafficEntry = {
  pid: number
  name: string
  connections: Connection[]
}

const NetworkTraffic = () => {
  const navigate = useNavigate()
  const [traffic, setTraffic] = useState<TrafficEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedPid, setExpandedPid] = useState<number | null>(null)

  const toggleExpand = (pid: number) => {
    setExpandedPid(prev => (prev === pid ? null : pid))
  }

  const fetchTraffic = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/network-traffic")
      const data = await res.json()
      console.log("✅ Traffic data:", data)
      if (data.traffic) setTraffic(data.traffic)
    } catch (err) {
      console.error("❌ Failed to fetch traffic data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTraffic()
  }, [])

  return (
    <Layout title="Network Traffic Snapshot">
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate("/network-security")}>
          <ArrowLeft size={16} style={{ marginRight: "6px" }} />
          Go Back
        </button>
      </div>

      <div className="traffic-header">
        <h3 className="traffic-title">Live Connection Summary</h3>
        <button className="log-toggle-button" onClick={fetchTraffic}>
          <RefreshCcw size={14} style={{ marginRight: "6px" }} />
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="log-loading-text">Loading network traffic...</p>
      ) : traffic.length === 0 ? (
        <p className="log-loading-text">No active connections found.</p>
      ) : (
        <div className="traffic-scroll-container">
          <div className="traffic-results">
            {traffic.map((entry, i) => (
              <div
                key={i}
                className={`traffic-card ${expandedPid === entry.pid ? "expanded" : ""}`}
              >
                <div
                  className="traffic-header-row clickable"
                  onClick={() => toggleExpand(entry.pid)}
                >
                  <strong>{entry.name || "Unknown"} (PID: {entry.pid})</strong>
                  {expandedPid === entry.pid ? (
                    <ChevronUp size={16} className="chevron-icon" />
                  ) : (
                    <ChevronDown size={16} className="chevron-icon" />
                  )}
                </div>

                {expandedPid === entry.pid && (
                  <table className="traffic-table">
                    <thead>
                      <tr>
                        <th>Local Address</th>
                        <th>Remote Address</th>
                        <th>Host</th>
                        <th>Country</th>
                        <th>ISP</th>
                        <th>Status</th>
                        <th>Suspicious</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.connections.map((conn, idx) => (
                        <tr key={idx} className={conn.suspicious ? "danger-row" : ""}>
                          <td>{conn.laddr}</td>
                          <td>{conn.raddr}</td>
                          <td>
                            <span className="hostname-tooltip" data-tooltip={conn.remote_host}>
                              {conn.remote_host.length > 18
                                ? `${conn.remote_host.slice(0, 15)}...`
                                : conn.remote_host}
                            </span>
                          </td>
                          <td>{conn.country || "Unknown"}</td>
                          <td>{conn.isp || "Unknown"}</td>
                          <td>{conn.status}</td>
                          <td className={conn.suspicious ? "danger-text" : ""}>
                            {conn.suspicious ? "⚠ Yes" : "No"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}

export default NetworkTraffic
