import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import StatCard from "../components/StatCard"
import StatGrid from "../components/StatGrid"
import { Shield, Search, Calendar, Activity } from "lucide-react"

const EndpointSecurity = () => {
  const navigate = useNavigate()

  return (
    <Layout title="Endpoint Security">
      <StatGrid>
        <StatCard 
        icon={<Shield size={30} />} 
        label="Malware Scan" 
        onClick={() => alert("Events clicked")} />
        <StatCard
          icon={<Search size={30} />}
          label="Port Scan"
          onClick={() => alert("Active Agents clicked")}
        />
        <StatCard
          icon={<Calendar size={30} />}
          label="Active Processes"
          onClick={() => alert("Alerts clicked")}
        />
        <StatCard
          icon={<Activity size={30} />}
          label="Performance "
          onClick={() => navigate("/dashboard")}
        />
      </StatGrid>
    </Layout>
  )
}

export default EndpointSecurity
