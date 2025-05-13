import Layout from "../../components/Layout"

import AgentList from "./agentList"                        
import "../../styles/AgentManagement.css"                   
const AgentManagement = () => {

  return (
    <Layout title="Agent Management">
      <div>
        <AgentList />
      </div>
    </Layout>
  )
}

export default AgentManagement
