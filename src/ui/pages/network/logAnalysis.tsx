import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { ArrowLeft } from "lucide-react"
import "../../styles/NetworkSecurity.css"

interface LogEntry {
  timestamp?: string
  event_id?: number
  type?: string
  severity?: string
  suspicious?: boolean
  system_generated?: boolean
  source?: string
  computer?: string
  message?: string
  details?: { [key: string]: string }
}

const LogAnalysis = () => {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [newKeys, setNewKeys] = useState<Set<string>>(new Set())

  const toggleSuspicious = () => {
    setShowSuspiciousOnly(prev => !prev)
    setExpandedIndex(null)
  }

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/logs")
        const data = await res.json()

        if (data.logs && Array.isArray(data.logs)) {
          setLogs(prevLogs => {
            const prevKeys = new Set(prevLogs.map(log => `${log.timestamp}_${log.event_id}`))
            const incomingLogs: LogEntry[] = data.logs
            const newLogItems = incomingLogs.filter(
              log => !prevKeys.has(`${log.timestamp}_${log.event_id}`)
            )

            if (newLogItems.length > 0) {
              const newKeySet = new Set(newLogItems.map(log => `${log.timestamp}_${log.event_id}`))
              setNewKeys(newKeySet)
            }

            return [...newLogItems, ...prevLogs].slice(0, 100)
          })
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
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredLogs = logs.filter((log) => {
    if (showSuspiciousOnly && !log.suspicious) return false

    const msg = log.message?.toLowerCase() || ""
    const src = log.source?.toLowerCase() || ""
    const type = log.type?.toLowerCase() || ""
    const term = searchTerm.toLowerCase()

    return (
      msg.includes(term) ||
      src.includes(term) ||
      type.includes(term)
    )
  })

  return (
    <Layout title="Log Analysis">
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate("/network-security")}> 
          <ArrowLeft size={16} style={{ marginRight: "6px" }} /> Go Back
        </button>
      </div>

      <div className="log-header">
        <h3 className="log-title">Security Events</h3>
        <div className="log-controls">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="log-search"
          />
          <button className="log-toggle-button" onClick={toggleSuspicious}>
            {showSuspiciousOnly ? "Show All" : "Show Only Suspicious"}
          </button>
        </div>
      </div>

      <div className="log-summary-bar">
        <span>Total: {logs.length}</span>
        <span>Suspicious: {logs.filter(l => l.suspicious).length}</span>
        <span>High: {logs.filter(l => l.severity?.toLowerCase() === 'high').length}</span>
        <span>Medium: {logs.filter(l => l.severity?.toLowerCase() === 'medium').length}</span>
        <span>Low: {logs.filter(l => l.severity?.toLowerCase() === 'low').length}</span>
      </div>

      {loading ? (
        <p className="log-loading-text">Loading logs...</p>
      ) : error ? (
        <div className="log-error-box">
          <p>{error}</p>
        </div>
      ) : (
        <div className="log-results">
          {filteredLogs.length === 0 ? (
            <p className="log-loading-text">No logs match your filters.</p>
          ) : (
            filteredLogs.map((log, index) => {
              const key = `${log.timestamp}_${log.event_id}`
              const isNew = newKeys.has(key)

              return (
                <div
                  key={key}
                  className={`log-card ${log.suspicious ? "suspicious" : ""} ${isNew ? "fade-in" : ""}`}
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  <div className="log-summary">
                    <span className="log-text-left">
                      <strong>{log.timestamp}</strong> — {log.message}
                    </span>
                    {log.severity && (
                      <span className={`log-severity log-severity-${log.severity.toLowerCase()}`}>
                        {log.severity}
                      </span>
                    )}
                  </div>

                  {expandedIndex === index && (
                    <div className="log-details">
                      <p><strong>Event ID:</strong> {log.event_id}</p>
                      <p><strong>Type:</strong> {log.type}</p>
                      <p><strong>Source:</strong> {log.source}</p>
                      <p><strong>Computer:</strong> {log.computer}</p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <>
                          <p><strong>Details:</strong></p>
                          <ul>
                            {Object.entries(log.details).map(([key, value], i) => (
                              <li key={i}><strong>{key}:</strong> {value}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </Layout>
  )
}

export default LogAnalysis;
