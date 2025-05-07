import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { ArrowLeft } from "lucide-react"
import "../../styles/NetworkSecurity.css"

type LogEntry = {
  timestamp?: string
  event_id?: number
  type?: string
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

        console.log("Received logs:", data)

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
    const msg = typeof log?.message === "string" ? log.message : ""
    const src = typeof log?.source === "string" ? log.source : ""
    const type = typeof log?.type === "string" ? log.type : ""
    const term = searchTerm.toLowerCase()

    return (
      msg.toLowerCase().includes(term) ||
      src.toLowerCase().includes(term) ||
      type.toLowerCase().includes(term)
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

      <div className="scan-header">
        <h3 className="section-title">Recent Security Events</h3>
        <div className="scan-controls">
          <input
            type="text"
            placeholder="Search by message, source, or type"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "8px", backgroundColor: "#2a2a2a", border: "1px solid #444", color: "#fff", borderRadius: "4px", width: "300px" }}
          />
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading logs...</p>
      ) : error ? (
        <div className="result-box result-danger">
          <p>{error}</p>
        </div>
      ) : (
        <div className="scan-results">
          <p style={{ color: "#ccc", fontStyle: "italic" }}>
            Showing {filteredLogs.length} of {logs.length} logs
          </p>
          {filteredLogs.length === 0 ? (
            <p className="loading-text">No matching logs found.</p>
          ) : (
            filteredLogs.map((log, i) => (
              <div key={i} className="result-card">
                <h4>{log.timestamp || "Unknown time"}</h4>
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
