import React, { createContext, useContext, useEffect, useState } from "react"

type HealthResult = {
  key: string
  status: "healthy" | "unhealthy"
  message: string
}

interface HealthCheckContextType {
  data: HealthResult[] | null
  loading: boolean
}

const HealthCheckContext = createContext<HealthCheckContextType>({
  data: null,
  loading: true,
})

export const useHealthCheck = () => useContext(HealthCheckContext)

export const HealthCheckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<HealthResult[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/health-check")
        const json = await res.json()
        setData(json.checks || [])
      } catch (err) {
        console.error("Health check failed:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
  }, [])  // ✅ Only run once on first load

  return (
    <HealthCheckContext.Provider value={{ data, loading }}>
      {children}
    </HealthCheckContext.Provider>
  )
}
