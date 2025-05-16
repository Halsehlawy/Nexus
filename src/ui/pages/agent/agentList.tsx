import { useEffect, useState } from "react"
import { User, X } from "lucide-react"
import "../../styles/AgentManagement.css"
import { useNavigate } from "react-router-dom"

type Agent = {
  id: number
  ip_address: string
  mac_address: string
  os: string
  status: string
  last_seen: string
  department?: string

}

const AgentList = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch("http://127.0.0.1:8000/agents")
      .then((res) => res.json())
      .then((data) => setAgents(data))
      .catch((err) => console.error("Failed to load agents:", err))
  }, [])

  const handleDelete = async (agentId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this agent?")
    if (!confirmed) return

    const res = await fetch(`http://127.0.0.1:8000/agents/${agentId}`, {
      method: "DELETE",
    })

    if (res.ok) {
      setSelectedAgent(null)
      const updated = await fetch("http://127.0.0.1:8000/agents").then((r) => r.json())
      setAgents(updated)
      setTimeout(() => setToast(null), 3000)
    } else {
      alert("Failed to delete agent.")
    }
  }

  const filteredAgents = showOnlineOnly
    ? agents.filter((agent) => agent.status.toLowerCase() === "online")
    : agents

  return (
    <>
      <div className="am-list-header">
        <h2 className="am-title">Connected Agents</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className=".button"
            onClick={() => setShowOnlineOnly((prev) => !prev)}
          >
            {showOnlineOnly ? "Show All" : "Show Online"}
          </button>
          <button className=".button" onClick={() => navigate("/add-agent")}>
            Add Agent
          </button>
        </div>
      </div>

      <div className="am-agents-grid">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="am-agent-card"
            onClick={() => setSelectedAgent(agent)}
            style={{ cursor: "pointer" }}
          >
            <User className="am-agent-icon" />
            <div className="am-agent-number">
            <span
              className={`am-status-circle ${
                agent.status.toLowerCase() === "online" ? "online" : "offline"
              }`}
            ></span>
            Agent {agent.id.toString()}
          </div>

          </div>
        ))}
      </div>

      {selectedAgent && (
        <div className="am-modal-overlay" onClick={() => setSelectedAgent(null)}>
          <div className="am-modal" onClick={(e) => e.stopPropagation()}>
            <button className="am-close-btn" onClick={() => setSelectedAgent(null)}>
              <X size={18} />
            </button>
            <h3>Agent {selectedAgent.id.toString()} Details</h3>
            <div className="am-modal-content">
              <p><strong>IP Address:</strong> {selectedAgent.ip_address}</p>
              <p><strong>MAC:</strong> {selectedAgent.mac_address}</p>
              <p><strong>OS:</strong> {selectedAgent.os}</p>
              <p><strong>Status:</strong> {selectedAgent.status}</p>
              <p><strong>Last Seen:</strong> {new Date(selectedAgent.last_seen).toLocaleString()}</p>
              <p><strong>Department:</strong> {selectedAgent.department ?? "-"}</p>

              <button
                className="am-delete-btn"
                onClick={() => handleDelete(selectedAgent.id)}
              >
                Delete Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="am-toast">{toast}</div>}
    </>
  )
}

export default AgentList
