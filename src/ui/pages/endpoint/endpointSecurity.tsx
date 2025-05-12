import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import StatCard from "../../components/StatCard"
import StatGrid from "../../components/StatGrid"
import { Shield, Search, Calendar, Logs, Check, X } from "lucide-react"
import "../../styles/EndpointSecurity.css"
import { useHealthCheck } from "./healthCheck"

const EndpointSecurity = () => {
  const navigate = useNavigate()
  const { data: checks, loading } = useHealthCheck()

  return (
    <Layout title="Endpoint Security">
      <StatGrid>
        <StatCard icon={<Shield size={30} />} label="Malware Scan" onClick={() => navigate("/endpoint/malwareScan")} />
        <StatCard icon={<Search size={30} />} label="Port Scan" onClick={() => navigate("/endpoint/portScan")} />
        <StatCard icon={<Calendar size={30} />} label="Active Processes" onClick={() => navigate("/endpoint/processes")} />
        <StatCard icon={<Logs size={30} />} label="Logs" onClick={() => navigate("/endpoint/logAnalysis")} />
      </StatGrid>

      <div className="health-check-container">
        <h3 className="section-title" style={{ marginBottom: "12px" }}>Endpoint Security Checks</h3>

        {loading || !checks ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <span>Checking system health...</span>
          </div>
        ) : (
          <ul className="health-list">
            {checks.map((item) => (
              <li key={item.key} className={item.status === "healthy" ? "healthy" : "unhealthy"}>
                {item.status === "healthy" ? <Check size={18} /> : <X size={18} />}
                {item.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}

export default EndpointSecurity
