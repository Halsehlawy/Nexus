import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import Layout from "../../components/Layout"
import StatCard from "../../components/StatCard"
import StatGrid from "../../components/StatGrid"
import { Shield, Search, Calendar, Gauge, Check, X } from "lucide-react"
import "../../styles/EndpointSecurity.css"

const EndpointSecurity = () => {
  const navigate = useNavigate()
  const [checks, setChecks] = useState<any>(null)

  useEffect(() => {
    fetch("http://127.0.0.1:8000/health-checks")
      .then(res => res.json())
      .then(data => setChecks(data))
      .catch(err => console.error("Health check error", err))
  }, [])

  return (
    <Layout title="Endpoint Security">
      <StatGrid>
        <StatCard icon={<Shield size={30} />} label="Malware Scan" onClick={() => navigate("/endpoint/malwareScan")} />
        <StatCard icon={<Search size={30} />} label="Port Scan" onClick={() => navigate("/endpoint/portScan")} />
        <StatCard icon={<Calendar size={30} />} label="Active Processes" onClick={() => navigate("/endpoint/processes")} />
        <StatCard icon={<Gauge size={30} />} label="Startup Programs" onClick={() => navigate("/endpoint/startupPrograms")} />
      </StatGrid>

      <div className="health-check-container">
        <h3 className="section-title">Endpoint Health Check</h3>
        {!checks ? (
          <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <span>Checking system health...</span>
          </div>
        ) : (
          <ul className="health-list">
            <li className={checks.windows_defender ? "healthy" : "unhealthy"}>
              {checks.windows_defender ? <Check size={18} /> : <X size={18} />}
              Windows Defender: {checks.windows_defender ? "Enabled" : "Disabled"}
            </li>
            <li className={checks.firewall ? "healthy" : "unhealthy"}>
              {checks.firewall ? <Check size={18} /> : <X size={18} />}
              Firewall: {checks.firewall ? "Enabled" : "Disabled"}
            </li>
            <li className={checks.guest_account ? "healthy" : "unhealthy"}>
              {checks.guest_account ? <Check size={18} /> : <X size={18} />}
              Guest Account: {checks.guest_account ? "Disabled" : "Enabled"}
            </li>
            <li className={checks.windows_update ? "healthy" : "unhealthy"}>
              {checks.windows_update ? <Check size={18} /> : <X size={18} />}
              Windows Updates: {checks.windows_update ? "Up to date" : "Pending updates"}
            </li>
            <li className={checks.admin_no_password ? "healthy" : "unhealthy"}>
              {checks.admin_no_password ? <Check size={18} /> : <X size={18} />}
              Admin Accounts: {checks.admin_no_password ? "Secured" : "Some without passwords"}
            </li>
            <li className={checks.suspicious_autoruns === 0 ? "healthy" : "unhealthy"}>
              {checks.suspicious_autoruns === 0 ? <Check size={18} /> : <X size={18} />}
              Suspicious Startup Items: {checks.suspicious_autoruns} flagged
            </li>
          </ul>
        )}
      </div>
    </Layout>
  )
}

export default EndpointSecurity
