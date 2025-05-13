import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Homepage from "./pages/homepage"
import AgentManagement from "./pages/agent/agentManagement"
import AddAgent from "./pages/agent/addAgent"
import EndpointSecurity from "./pages/endpoint/endpointSecurity"
import { HealthCheckProvider } from "./pages/endpoint/healthCheck"
import ProcessMonitor from "./pages/endpoint/processMonitor"
import PortScan from "./pages/endpoint/portScan"
import StartupPrograms from "./pages/endpoint/startupPrograms"
import MalwareScan from "./pages/endpoint/malwareScan"
import NetworkSecurity from "./pages/network/networkSecurity"
import FirewallRules from "./pages/network/FirewallRules"
import NetworkScan from "./pages/network/networkScan"
import LogAnalysis from "./pages/endpoint/logAnalysis"
import ThreatIntelligence from "./pages/threatIntelligence"
import "./styles/global.css"
import "./styles/dashboard.css"


function App() {
  return (
    <HealthCheckProvider>
    <Router>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/endpoint-security" element={<EndpointSecurity />} />
        <Route path="/endpoint/processes" element={<ProcessMonitor />} />
        <Route path="/endpoint/malwareScan" element={<MalwareScan />} />
        <Route path="/endpoint/portScan" element={<PortScan />} />
        <Route path="/endpoint/startupPrograms" element={<StartupPrograms />} />
        <Route path="/endpoint/logAnalysis" element={<LogAnalysis />} />  
        <Route path="/network-security" element={<NetworkSecurity />} />
        <Route path="/network/firewallRules" element={<FirewallRules />} />
        <Route path="/network/networkScan" element={<NetworkScan />} />
        <Route path="/agent-management" element={<AgentManagement />} />
        <Route path="/add-agent" element={<AddAgent />} />
        <Route path="/threat-intelligence" element={<ThreatIntelligence />} />

      </Routes>
    </Router>
  </HealthCheckProvider>
  )
}

export default App
