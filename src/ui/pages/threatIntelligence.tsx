import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import "../styles/ThreatIntel.css"

type Threat = {
  title: string
  category: string
  description: string
  ttp: string[]
  mitigation: string[]
  date: string
  source: string
}

const parseLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.split(urlRegex).map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="threat-link">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

const LatestThreats = () => {
  const [threats, setThreats] = useState<Threat[]>([])
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://127.0.0.1:8000/threat-intel/latest")
      .then((res) => res.json())
      .then(data => {
        setThreats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <Layout title="Latest Threats and Mitigations">
      {loading ? (
        <div className="threat-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="threat-grid">
          {threats.map((threat, idx) => (
            <div key={idx} className="threat-card">
              <div onClick={() => toggleExpand(idx)} className="threat-header">
                <h3>{threat.title}</h3>
                <p className="meta">
                  <strong>{threat.category}</strong> | <strong>{threat.date}</strong>
                </p>
              </div>
              {expandedIndex === idx && (
                <div className="threat-details">
                  <p>{parseLinks(threat.description)}</p>
                  <p><strong>TTPs:</strong> {threat.ttp.join(", ")}</p>
                  <p><strong>Mitigations:</strong></p>
                  <ul>
                    {threat.mitigation.map((step, i) => (
                      <li key={i}>{parseLinks(step)}</li>
                    ))}
                  </ul>
                  <p className="source">Source: {threat.source}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default LatestThreats
