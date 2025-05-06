import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import Layout from "../../components/Layout"
import "../../styles/NetworkSecurity.css"

const scanOptions = [
  "Quick Scan",
  "Ping Sweep",
  "Service Detection",
  "OS Detection",
  "Aggressive Scan"
]

const NetworkScan = () => {
  const navigate = useNavigate()
  const [networks, setNetworks] = useState<string[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [selectedScan, setSelectedScan] = useState("Quick Scan")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [expandedHost, setExpandedHost] = useState<string | null>(null)

  useEffect(() => {
    fetch("http://127.0.0.1:8000/network-scan/subnet")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.subnets)) {
          setNetworks(data.subnets)
          setSelectedNetwork(data.subnets[0] || "")
        } else if (typeof data.subnet === "string") {
          setNetworks([data.subnet])
          setSelectedNetwork(data.subnet)
        }
      })
  }, [])

  const handleScan = async () => {
    if (!selectedNetwork) return
    setLoading(true)
    setResults(null)
    try {
      const res = await fetch("http://127.0.0.1:8000/network-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subnet: selectedNetwork, scan_type: selectedScan })
      })
      const data = await res.json()
      setResults(data)
    } catch (err) {
      setResults({ error: "Scan failed." })
    } finally {
      setLoading(false)
    }
  }

  const toggleHostExpand = (host: string) => {
    setExpandedHost(prev => (prev === host ? null : host))
  }

  return (
    <Layout title="Network Scan">
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate("/network-security")}> 
          <ArrowLeft size={16} style={{ marginRight: "6px" }} /> Go Back
        </button>
      </div>

      <div className="scan-header">
        <h3 className="section-title">Network Scan</h3>
        <div className="scan-controls">
          <select value={selectedNetwork} onChange={(e) => setSelectedNetwork(e.target.value)}>
            {networks.map((net, i) => <option key={i} value={net}>{net}</option>)}
          </select>
          <select value={selectedScan} onChange={(e) => setSelectedScan(e.target.value)}>
            {scanOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <button className="button" onClick={handleScan} disabled={loading || !selectedNetwork}>
            {loading ? <span className="spinner-inline"></span> : "Start Scan"}
          </button>
        </div>
      </div>

      {loading && <p className="loading-text">Running Nmap scan, please wait...</p>}

      {results && results.error && (
        <div className="result-box result-danger">
          <p>Error: {results.error}</p>
        </div>
      )}

      {results && !results.error && (
        <div className="scan-results">
          {Object.entries(results).map(([host, data]: any) => (
            <div key={host} className="result-card">
              <div className="result-summary" onClick={() => toggleHostExpand(host)}>
                <h4>{host} ({data.hostname || "Unknown"})</h4>
                <p>Status: <strong>{data.state}</strong></p>
              </div>

              {expandedHost === host && (
                <div className="result-details">
                  {data.tcp && Object.keys(data.tcp).length > 0 && (
                    <div>
                      <p><strong>Open TCP Ports:</strong></p>
                      <ul>
                        {Object.entries(data.tcp).map(([port, info]: any) => (
                          <li key={port}>{port}/tcp - {info.name} ({info.state})</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {data.os && data.os.length > 0 && (
                    <div>
                      <p><strong>OS Matches:</strong></p>
                      <ul>
                        {data.os.map((match: any, i: number) => (
                          <li key={i}>{match.name} (Accuracy: {match.accuracy}%)</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default NetworkScan
