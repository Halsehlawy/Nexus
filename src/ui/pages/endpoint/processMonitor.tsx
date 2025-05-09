import { useEffect, useState } from "react"
import Layout from "../../components/Layout"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import "../../styles/EndpointSecurity.css"

type Process = {
  pid: number
  name: string
  user: string
  cpu: number
  memory: number
  path: string
  suspicious: boolean
  suspicious_reasons: string[]
}

const ProcessMonitor = () => {
  const navigate = useNavigate()
  const [processes, setProcesses] = useState<Process[]>([])
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Process>("pid")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedPid, setSelectedPid] = useState<number | null>(null)

  const fetchProcesses = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/processes")
      const data = await res.json()
      if (Array.isArray(data)) {
        const cleaned = data.map(p => ({
          ...p,
          suspicious_reasons: Array.isArray(p.suspicious_reasons) ? p.suspicious_reasons : []
        }))
        setProcesses(cleaned)
      } else {
        setProcesses([])
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setProcesses([])
    } finally {
      setLoading(false)
    }
  }

  const handleKill = async () => {
    if (!selectedPid) return
    try {
      const res = await fetch("http://127.0.0.1:8000/kill-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pid: selectedPid })
      })
      const msg = await res.json()
      if (!res.ok) {
        alert("Failed: " + msg.detail)
      } else {
        alert(msg.message)
        fetchProcesses()
        setSelectedPid(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchProcesses()
  }, [])

  useEffect(() => {
    if (!Array.isArray(processes)) return

    const filtered = processes
      .filter(p => {
        const nameMatch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
        const userMatch = p.user?.toLowerCase().includes(searchTerm.toLowerCase()) || false
        return nameMatch || userMatch
      })
      .sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        } else if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal
        } else if (typeof aVal === "boolean" && typeof bVal === "boolean") {
          return sortOrder === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal)
        }
        return 0
      })

    setFilteredProcesses(filtered)
  }, [searchTerm, processes, sortField, sortOrder])

  const handleSort = (field: keyof Process) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  return (
      <Layout title="Active Processes">
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate("/endpoint-security")}>
            <ArrowLeft size={18} style={{ marginRight: "8px" }} />
            Go Back
          </button>
        </div>
    
        <div className="process-container-wide">
          <div className="table-header">
            <h2 className="process-title">Active Processes</h2>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by name or user..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button
                className="button"
                onClick={handleKill}
                style={{ marginLeft: "10px" }}
                disabled={!selectedPid}
              >
                Kill Process
              </button>
            </div>
          </div>
    
          {loading ? (
            <p className="loading-text">Loading processes...</p>
          ) : (
            <div className="table-wrapper">
              <table className="process-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("pid")}>PID</th>
                    <th onClick={() => handleSort("name")}>Name</th>
                    <th onClick={() => handleSort("user")}>User</th>
                    <th onClick={() => handleSort("cpu")}>CPU</th>
                    <th onClick={() => handleSort("memory")}>RAM</th>
                    <th onClick={() => handleSort("suspicious")}>Suspicious</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProcesses.map(proc => (
                    <tr
                      key={proc.pid}
                      onClick={() => setSelectedPid(proc.pid === selectedPid ? null : proc.pid)}
                      className={proc.pid === selectedPid ? "selected-row" : ""}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{proc.pid}</td>
                      <td>{proc.name}</td>
                      <td>{proc.user || "N/A"}</td>
                      <td className={proc.cpu > 25 ? "highlight-red" : ""}>{proc.cpu}</td>
                      <td className={proc.memory > 150 ? "highlight-red" : ""}>{proc.memory}</td>
                      <td>
                        {proc.suspicious && proc.suspicious_reasons.length > 0 ? (
                          <div className="tooltip-container left">
                            <span className="suspicious-flag">⚠ Suspicious</span>
                            <div className="tooltip-content">
                              <ul>
                                {proc.suspicious_reasons.map((reason, index) => (
                                  <li key={index}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          "–"
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredProcesses.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
                        No matching processes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Layout>
    )
    
  
}

export default ProcessMonitor
