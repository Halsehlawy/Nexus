import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Homepage from './pages/homepage';
import ServerManagement from './pages/serverManagement';
import AgentManagement from './pages/agentManagement';
import EndpointSecurity from './pages/endpointSecurity';
import NetworkSecurity from './pages/networkSecurity';
import ThreatIntelligence from './pages/threatIntelligence';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main landing route */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Main navigation routes */}
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/server-management" element={<ServerManagement />} />
        <Route path="/endpoint-security" element={<EndpointSecurity />} />
        <Route path="/network-security" element={<NetworkSecurity />} />
        <Route path="/agent-management" element={<AgentManagement />} />
        <Route path="/threat-intelligence" element={<ThreatIntelligence />} />
      </Routes>
    </Router>
  );
}

export default App;
