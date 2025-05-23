import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { ArrowLeft } from "lucide-react"
import "../../styles/NetworkSecurity.css"

interface Rule {
  Name: string
  DisplayName: string
  Direction: string
  Enabled: string
  Action: string
  Profile: string
}

const FirewallRules = () => {
  const navigate = useNavigate()
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    direction: "Inbound",
    action: "Allow",
    protocol: "TCP",
    localport: ""
  })

  const fetchRules = async () => {
    setLoading(true)
    const res = await fetch("http://127.0.0.1:8000/firewall-rules")
    const data = await res.json()
    setRules(data.rules)
    setLoading(false)
  }

  const deleteRule = async () => {
    if (!selectedRule) return
    if (!window.confirm(`Delete rule '${selectedRule.Name}'?`)) return
    await fetch("http://127.0.0.1:8000/firewall-rules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: selectedRule.Name })
    })
    setSelectedRule(null)
    fetchRules()
  }

  const createRule = async () => {
    await fetch("http://127.0.0.1:8000/firewall-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
    setFormData({ name: "", direction: "Inbound", action: "Allow", protocol: "TCP", localport: "" })
    setShowForm(false)
    fetchRules()
  }

  const filteredRules = rules.filter(rule =>
    rule.DisplayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchRules()
  }, [])

  return (
    <Layout title="Firewall Rules">
      <div className="firewall-container">
        {/* Back Button */}
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate("/network-security")}>
            <ArrowLeft size={16} style={{ marginRight: "6px" }} />
            Go Back
          </button>
        </div>

        {/* Header */}
        <div className="section-header">
          <h3 className="section-title">Firewall Rules</h3>
          <div className="row-group" style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              className="input"
              placeholder="Search by rule name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="button" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "Add Rule"}
            </button>
            <button className="button" onClick={deleteRule} disabled={!selectedRule}>
              Delete Selected
            </button>
          </div>
        </div>

        {/* Rule Form */}
        {showForm && (
          <div style={{ padding: "16px", border: "1px solid #444", borderRadius: "8px", marginBottom: "16px", background: "#1e1e1e" }}>
            <h4 className="section-title">Create New Rule</h4>
            <div className="row-group" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Port"
                value={formData.localport}
                onChange={(e) => setFormData({ ...formData, localport: e.target.value })}
                className="input"
              />
              <select
                className="input"
                value={formData.direction}
                onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
              >
                <option>Inbound</option>
                <option>Outbound</option>
              </select>
              <select
                className="input"
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              >
                <option>Allow</option>
                <option>Block</option>
              </select>
              <select
                className="input"
                value={formData.protocol}
                onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
              >
                <option>TCP</option>
                <option>UDP</option>
              </select>
              <button className="button" onClick={createRule}>Create</button>
            </div>
          </div>
        )}

        {/* Scrollable Table */}
        {loading ? (
          <div className="spinner-inline" style={{ margin: "40px auto" }}></div>
        ) : (
          <div className="table-scroll-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Direction</th>
                  <th>Action</th>
                  <th>Enabled</th>
                  <th>Profile</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map(rule => (
                  <tr
                    key={rule.Name}
                    onClick={() => setSelectedRule(rule)}
                    className={selectedRule?.Name === rule.Name ? "selected-row" : ""}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{rule.DisplayName || rule.Name}</td>
                    <td>{rule.Direction}</td>
                    <td>{rule.Action}</td>
                    <td>{rule.Enabled}</td>
                    <td>{rule.Profile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default FirewallRules
