import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { ArrowLeft } from "lucide-react"
import "../../styles/EndpointSecurity.css"

type PortEntry = {
  port: number
  protocol: string
  service: string
  pid: number
  process_name: string
}

const PortScan = () => {
  const navigate = useNavigate()
  const [ports, setPorts] = useState<PortEntry[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedPid, setSelectedPid] = useState<number | null>(null)
  const [sortField, setSortField] = useState<keyof PortEntry>("port")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const fetchPorts = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/open-ports")
      const data = await res.json()
      setPorts(data.ports)
    } catch (err) {
      console.error("Failed to fetch ports:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleClosePort = async () => {
    if (!selectedPid) return
    try {
      const res = await fetch("http://127.0.0.1:8000/close-port", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pid: selectedPid })
      })

      const result = await res.json()
      if (!res.ok) {
        alert("Error: " + result.detail)
      } else {
        alert(result.message)
        fetchPorts()
        setSelectedPid(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSort = (field: keyof PortEntry) => {
    if (field === sortField) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const filtered = ports
    .filter(p =>
      p.process_name.toLowerCase().includes(search.toLowerCase()) ||
      p.service.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      if (aVal == null || bVal == null) return 0

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal
      }

      return 0
    })

  useEffect(() => {
    fetchPorts()
  }, [])

  return (
    <Layout title="Port Scanner">
      <div className="back-button-container">
        <button className="button" onClick={() => navigate("/endpoint-security")}>
          <ArrowLeft size={16} style={{ marginRight: "6px" }} />
          Go Back
        </button>
      </div>

      <div className="container-box">
        <div className="table-header">
          <h2 className="section-title">Open Ports</h2>
          <div className="row-group">
            <input
              type="text"
              className="input"
              placeholder="Search process or service..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              className="button"
              onClick={handleClosePort}
              disabled={!selectedPid}
            >
              Close Port
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner" />
            Scanning ports...
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("port")}>Port</th>
                  <th onClick={() => handleSort("protocol")}>Protocol</th>
                  <th onClick={() => handleSort("service")}>Service</th>
                  <th onClick={() => handleSort("pid")}>PID</th>
                  <th onClick={() => handleSort("process_name")}>Process</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr
                    key={`${entry.port}-${entry.pid}`}
                    onClick={() => setSelectedPid(entry.pid === selectedPid ? null : entry.pid)}
                    className={entry.pid === selectedPid ? "selected-row" : ""}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{entry.port}</td>
                    <td>{entry.protocol}</td>
                    <td>{entry.service}</td>
                    <td>{entry.pid}</td>
                    <td>{entry.process_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default PortScan
