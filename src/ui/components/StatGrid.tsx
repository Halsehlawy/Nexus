import type { ReactNode } from "react"
import "../styles/statcard.css"

interface StatGridProps {
  children: ReactNode
}

const StatGrid = ({ children }: StatGridProps) => {
  return <div className="stat-grid">{children}</div>
}

export default StatGrid
