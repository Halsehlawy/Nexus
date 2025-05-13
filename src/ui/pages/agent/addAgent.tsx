import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import "../../styles/AgentManagement.css"

const AddAgent = () => {
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget


    const submissionPayload = {
      ip_address: (form.ip_address as any).value,
      mac_address: (form.mac_address as any).value,
      os: (form.os as any).value,
      department: (form.department as any).value,
      status: (form.status as any).value,
    }

    console.log("📤 Submitting agent data:", submissionPayload)

    const res = await fetch("http://127.0.0.1:8000/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submissionPayload),
    })

    if (res.ok) {
      navigate("/agent-management")
    } else {
      alert("Failed to add agent.")
    }
  }

  return (
    <Layout title="Add Agent">
      <div className="am-agent-form-wrapper">
        <h2 className="am-title" style={{ marginBottom: "20px" }}>Add New Agent</h2>
        <form className="am-modal-content" onSubmit={handleSubmit}>
          <input name="ip_address" required placeholder="IP Address" />
          <input name="mac_address" required placeholder="MAC Address" />
          <input name="os" required placeholder="Operating System" />
          <input name="department" placeholder="Department (optional)" />

          <select name="status" defaultValue="" required>
            <option value="" disabled>Select Status</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>


          <button type="submit" className="am-toggle-btn">Add Agent</button>
        </form>
      </div>
    </Layout>
  )
}

export default AddAgent
