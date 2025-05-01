import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Homepage from './homepage';
import ServerManagement from './serverManagement';
import AgentManagement from './agentManagement';
import EndpointSecurity from './endpointSecurity';
import NetworkSecurity from './networkSecurity';
import ThreatIntelligence from './threatIntelligence';

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
