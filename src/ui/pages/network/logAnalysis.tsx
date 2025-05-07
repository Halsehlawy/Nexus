import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { ArrowLeft } from "lucide-react"
import "../../styles/NetworkSecurity.css"

type LogEntry = {
  timestamp?: string
  event_id?: number
  type?: string
  severity?: string
  suspicious?: boolean
  source?: string
  computer?: string
  message?: string
}

const LogAnalysis = () => {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("http://127.0.0.1:8000/logs")
        const data = await res.json()
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs)
        } else {
          setError("No logs found or format incorrect.")
        }
      } catch (err) {
        console.error("Error fetching logs", err)
        setError("Error loading logs")
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase()
    return (
      log?.event_id?.toString().includes(term) ||
      log?.type?.toLowerCase().includes(term) ||
      log?.source?.toLowerCase().includes(term) ||
      log?.message?.toLowerCase().includes(term) ||
      log?.computer?.toLowerCase().includes(term)
    )
  })

  return (
    <Layout title="Log Analysis">
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate("/network-security")}>
          <ArrowLeft size={16} style={{ marginRight: "6px" }} />
          Go Back
        </button>
      </div>

      <div className="log-header">
        <h3 className="log-title">Recent Security Events</h3>
        <div className="log-controls">
          <input
            type="text"
            placeholder="Search by message, source, or type"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="log-search"
          />
        </div>
      </div>

      {loading ? (
        <p className="log-loading-text">Loading logs...</p>
      ) : error ? (
        <div className="log-error-box">
          <p>{error}</p>
        </div>
      ) : (
        <div className="log-results">
          <p style={{ color: "#ccc", fontStyle: "italic" }}>
            Showing {filteredLogs.length} of {logs.length} logs
          </p>
          {filteredLogs.length === 0 ? (
            <p className="log-loading-text">No matching logs found.</p>
          ) : (
            filteredLogs.map((log, i) => (
              <div
                key={i}
                className={`log-card ${log.suspicious ? "suspicious" : ""}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h4>{log.timestamp || "Unknown time"}</h4>
                  {log.severity && (
                    <span className={`log-severity log-severity-${log.severity.toLowerCase()}`}>
                      {log.severity}
                    </span>
                  )}
                </div>
                <p><strong>Event ID:</strong> {log.event_id ?? "?"}</p>
                <p><strong>Type:</strong> {log.type ?? "Unknown"}</p>
                <p><strong>Source:</strong> {log.source ?? "Unknown"}</p>
                <p><strong>Computer:</strong> {log.computer ?? "Unknown"}</p>
                <p><strong>Message:</strong> {log.message ?? "No message"}</p>
              </div>
            ))
          )}
        </div>
      )}
    </Layout>
  )
}

export default LogAnalysis
