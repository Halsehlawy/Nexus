import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Layout from "../../components/Layout"
import { ArrowLeft } from "lucide-react"
import "../../styles/EndpointSecurity.css"

type Process = {
  pid: number
  name: string
  user: string
  cpu: number
  memory: number
  path: string
  suspicious: boolean
}

const ProcessMonitor = () => {
  const navigate = useNavigate()
  const [processes, setProcesses] = useState<Process[]>([])
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Process>("pid")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // ✅ New state
  const [selectedPid, setSelectedPid] = useState<number | null>(null)

  const fetchProcesses = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/processes")
      const data = await res.json()
      setProcesses(data.processes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Kill selected process
  const handleKill = async () => {
    if (!selectedPid) return
    try {
      const res = await fetch("http://127.0.0.1:8000/kill-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pid: selectedPid })
      })

      if (!res.ok) {
        const err = await res.json()
        alert("Failed: " + err.detail)
      } else {
        const msg = await res.json()
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
    let filtered = processes.filter(p => {
      const nameMatch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
      const userMatch = p.user?.toLowerCase().includes(searchTerm.toLowerCase()) || false
      return nameMatch || userMatch
    })

    filtered = filtered.sort((a, b) => {
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
            {/* ✅ Kill button next to search */}
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
          <table className="process-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("pid")}>PID</th>
                <th onClick={() => handleSort("name")}>Name</th>
                <th onClick={() => handleSort("user")}>User</th>
                <th onClick={() => handleSort("cpu")}>CPU </th>
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
                  <td>{proc.cpu}</td>
                  <td>{proc.memory}</td>
                  <td>
                    {proc.suspicious ? (
                      <span className="suspicious-flag">⚠ Suspicious</span>
                    ) : (
                      "–"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}

export default ProcessMonitor
