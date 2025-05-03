import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import StatCard from "../components/StatCard"
import StatGrid from "../components/StatGrid"
import { Grid, Users, AlertTriangle, Crosshair } from "lucide-react"

const NetworkSecurity = () => {
  const navigate = useNavigate()

  return (
    <Layout title="Network Security">
      <StatGrid>
        <StatCard icon={<Grid size={24} />} count={690} label="Events" onClick={() => alert("Events clicked")} />
        <StatCard
          icon={<Users size={24} />}
          count={120}
          label="Active Agents"
          onClick={() => alert("Active Agents clicked")}
        />
        <StatCard
          icon={<AlertTriangle size={24} />}
          count={95}
          label="Alerts"
          onClick={() => alert("Alerts clicked")}
        />
        <StatCard
          icon={<Crosshair size={24} />}
          count={23}
          label="Incidents"
          onClick={() => alert("Incidents clicked")}
        />
      </StatGrid>
    </Layout>
  )
}

export default NetworkSecurity
