import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import StatCard from "../../components/StatCard"
import StatGrid from "../../components/StatGrid"
import { BrickWallFire, Search, ArrowUpDown, Siren } from "lucide-react"
import "../../styles/NetworkSecurity.css"
import netGraph from "../../assets/netGraph.png"

const NetworkSecurity = () => {
  const navigate = useNavigate()

  return (
    <Layout title="Network Security">
      <StatGrid>
        <StatCard icon={<BrickWallFire size={30} />} label="Firewall" onClick={() => navigate("/network/firewallRules")} />
        <StatCard icon={<Search size={30} />} label="Network Scan" onClick={() => navigate("/network/networkScan")} />
        <StatCard icon={<ArrowUpDown size={30} />} label="Traffic " onClick={() => navigate("/network/traffic")} />
        <StatCard icon={<Siren size={30} />} label="Rogue Devices" onClick={() => navigate("/network/rogueDevices")} />
      </StatGrid>

<img src={netGraph} alt="Network Traffic Graph" className="network-graph" />    </Layout>
  )
}

export default NetworkSecurity
