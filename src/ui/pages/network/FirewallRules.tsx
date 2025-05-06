import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { ArrowLeft } from "lucide-react"
import "../../styles/EndpointSecurity.css"

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

  useEffect(() => { fetchRules() }, [])

  return (
    <Layout title="Firewall Rules">
      <div className="firewall-container">
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate("/network-security")}> 
            <ArrowLeft size={16} style={{ marginRight: "6px" }} /> Go Back
          </button>
        </div>

        <div className="firewall-control-bar">
          <h3 className="section-title">Existing Rules</h3>
          <div className="button-search-group">
            <div className="button-group">
              <button className="button" onClick={() => setShowForm(!showForm)}>
                {showForm ? "Cancel" : "Add Rule"}
              </button>
              <button className="button" onClick={deleteRule} disabled={!selectedRule}>
                Delete Selected
              </button>
            </div>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by rule name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {showForm && (
          <div className="rule-form">
            <h3 className="section-title">Create New Rule</h3>
            <div className="row-group">
              <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <input type="text" placeholder="Port" value={formData.localport} onChange={e => setFormData({ ...formData, localport: e.target.value })} />
              <select value={formData.direction} onChange={e => setFormData({ ...formData, direction: e.target.value })}>
                <option>Inbound</option>
                <option>Outbound</option>
              </select>
              <select value={formData.action} onChange={e => setFormData({ ...formData, action: e.target.value })}>
                <option>Allow</option>
                <option>Block</option>
              </select>
              <select value={formData.protocol} onChange={e => setFormData({ ...formData, protocol: e.target.value })}>
                <option>TCP</option>
                <option>UDP</option>
              </select>
              <button onClick={createRule}>Create</button>
            </div>
          </div>
        )}

        {loading ? (
        <div className="spinner-wrapper">
            <div className="spinner"></div>
        </div>
        ) : (
        <div className="firewall-table-wrapper">

            <table className="process-table">
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
