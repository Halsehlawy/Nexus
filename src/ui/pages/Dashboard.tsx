import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import StatCard from "../components/StatCard"
import StatGrid from "../components/StatGrid"
import { Grid, Users, AlertTriangle, Crosshair } from "lucide-react"

const Dashboard = () => {
  const navigate = useNavigate()

  return (
    <Layout title="Dashboard">
      <StatGrid>
        <StatCard icon={<Grid size={30} />} count={690} label="Events" onClick={() => alert("Events clicked")} />
        <StatCard
          icon={<Users size={30} />}
          count={120}
          label="Active Agents"
          onClick={() => alert("Active Agents clicked")}
        />
        <StatCard
          icon={<AlertTriangle size={30} />}
          count={95}
          label="Alerts"
          onClick={() => alert("Alerts clicked")}
        />
        <StatCard
          icon={<Crosshair size={30} />}
          count={23}
          label="Incidents"
          onClick={() => navigate("/dashboard")}
        />
      </StatGrid>

      <div className="dashboard-graphs">
        <div className="graph-row">
          <img src="/src/ui/assets/graph1.png" alt="Graph 1" className="dashboard-graph" />
          <img src="/src/ui/assets/graph2.png" alt="Graph 2" className="dashboard-graph" />
        </div>
        <img src="/src/ui/assets/graph33.png" alt="Graph 3" className="dashboard-graph full-width" />
      </div>
    </Layout>
  )
}

export default Dashboard
