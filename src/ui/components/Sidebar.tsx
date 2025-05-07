"use client"

import { useNavigate, useLocation } from "react-router-dom"
import "../styles/sidebar.css"
import { BrainCircuit, Monitor, Network, ServerIcon, User } from "lucide-react"

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
        <div className="logo-text">
          <span className="logo-primary">NEXUS</span>
          <span className="logo-secondary">Server</span>
        </div>
      </div>

      <nav className="sidebar-nav">

        <button
          className={`nav-item ${isActive("/server-management") ? "active" : ""}`}
          onClick={() => navigate("/server-management")}
        >
        {<ServerIcon size={20} />} Server Management
        </button>

        <button
          className={`nav-item ${isActive("/agent-management") ? "active" : ""}`}
          onClick={() => navigate("/agent-management")}
        >
        {<User size={20} />}  Agent Management
        </button>

        <button
          className={`nav-item ${isActive("/endpoint-security") ? "active" : ""}`}
          onClick={() => navigate("/endpoint-security")}
        >
          {<Monitor size={20} />}Endpoint Security
        </button>

        <button
          className={`nav-item ${isActive("/network-security") ? "active" : ""}`}
          onClick={() => navigate("/network-security")}
        >
        {<Network size={20} />}  Network Security
        </button>

        <button
          className={`nav-item ${isActive("/threat-intelligence") ? "active" : ""}`}
          onClick={() => navigate("/threat-intelligence")}
        >
        {<BrainCircuit size={20} />}  Threat Intelligence
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar
