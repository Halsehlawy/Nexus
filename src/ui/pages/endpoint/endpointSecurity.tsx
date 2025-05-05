import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import StatCard from "../../components/StatCard"
import StatGrid from "../../components/StatGrid"
import { Shield, Search, Calendar, Activity } from "lucide-react"

const EndpointSecurity = () => {
  const navigate = useNavigate()

  return (
    <Layout title="Endpoint Security">
      <StatGrid>
        <StatCard icon={<Shield size={30} />} label="Malware Scan" onClick={() => navigate("/endpoint/malwareScan")} />
        <StatCard icon={<Search size={30} />} label="Port Scan" onClick={() => navigate("/endpoint/portscan")} />
        <StatCard icon={<Calendar size={30} />} label="Active Processes" onClick={() => navigate("/endpoint/processes")} />
        <StatCard icon={<Activity size={30} />} label="Performance" onClick={() => navigate("/endpoint/performance")} />
      </StatGrid>
    </Layout>
  )
}

export default EndpointSecurity
