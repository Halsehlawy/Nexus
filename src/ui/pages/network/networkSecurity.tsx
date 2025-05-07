import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import StatCard from "../../components/StatCard"
import StatGrid from "../../components/StatGrid"
import { BrickWallFire, Search, FileClock, Crosshair } from "lucide-react"
import "../../styles/NetworkSecurity.css"
 

const NetworkSecurity = () => {
  const navigate = useNavigate()

  return (
    <Layout title="Network Security">
      <StatGrid>
        <StatCard icon={<BrickWallFire size={30} />} label="Firewall" onClick={() => navigate("/network/firewallRules")} />
        <StatCard icon={<Search size={30} />} label="Network Scan" onClick={() => navigate("/network/networkScan")}/>
        <StatCard icon={<FileClock size={30} />} label="Log Analysis" onClick={() => navigate("/network/logAnalysis")}/>
        <StatCard
          icon={<Crosshair size={30} />}
          count={23}
          label="Incidents"
          onClick={() => navigate("/dashboard")}
        />
      </StatGrid>
    </Layout>
  )
}

export default NetworkSecurity
