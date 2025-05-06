import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { ArrowLeft } from "lucide-react"
import "../../styles/EndpointSecurity.css"

type StartupEntry = {
  name: string
  basename: string
  path: string
  location: string
  suspicious: boolean
}

const StartupPrograms = () => {
  const navigate = useNavigate()
  const [programs, setPrograms] = useState<StartupEntry[]>([])
  const [selected, setSelected] = useState<{ name: string; location: string } | null>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchStartupPrograms = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/startup-programs")
      const data = await res.json()
      setPrograms(data.programs)
    } catch (err) {
      console.error("Failed to load startup programs", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    if (!selected) return
    try {
      const res = await fetch("http://127.0.0.1:8000/disable-startup-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected)
      })

      const data = await res.json()
      if (!res.ok) {
        alert("Error: " + data.detail)
      } else {
        alert(data.message)
        fetchStartupPrograms()
        setSelected(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchStartupPrograms()
  }, [])

  const filtered = programs.filter(p =>
    p.basename.toLowerCase().includes(search.toLowerCase()) ||
    p.path.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout title="Startup Program Analyzer">
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate("/endpoint-security")}>
          <ArrowLeft size={16} style={{ marginRight: "6px" }} />
          Go Back
        </button>
      </div>

      <div className="process-container-wide">
        <div className="table-header">
          <h2 className="process-title">Startup Programs</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="button" style={{ marginLeft: "10px" }} onClick={handleDisable} disabled={!selected}>
              Disable
            </button>
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Loading programs...</p>
        ) : (
          <table className="process-table">
            <thead>
              <tr>
                <th>Program</th>
                <th>Location</th>
                <th>Suspicious</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => (
                <tr
                  key={i}
                  onClick={() =>
                    setSelected(
                      selected?.name === entry.name && selected?.location === entry.location
                        ? null
                        : { name: entry.name, location: entry.location }
                    )
                  }
                  className={
                    selected?.name === entry.name && selected?.location === entry.location ? "selected-row" : ""
                  }
                  style={{ cursor: "pointer" }}
                  title={entry.path}
                >
                  <td>{entry.basename || entry.name}</td>
                  <td>{entry.location}</td>
                  <td>{entry.suspicious ? <span className="suspicious-flag">⚠ Suspicious</span> : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}

export default StartupPrograms
