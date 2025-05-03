"use client"

import { useNavigate, useLocation } from "react-router-dom"
import "../styles/sidebar.css"

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
          Server Management
        </button>

        <button
          className={`nav-item ${isActive("/agent-management") ? "active" : ""}`}
          onClick={() => navigate("/agent-management")}
        >
          Agent Management
        </button>

        <button
          className={`nav-item ${isActive("/endpoint-security") ? "active" : ""}`}
          onClick={() => navigate("/endpoint-security")}
        >
          Endpoint Security
        </button>

        <button
          className={`nav-item ${isActive("/network-security") ? "active" : ""}`}
          onClick={() => navigate("/network-security")}
        >
          Network Security
        </button>

        <button
          className={`nav-item ${isActive("/threat-intelligence") ? "active" : ""}`}
          onClick={() => navigate("/threat-intelligence")}
        >
          Threat Intelligence
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar
