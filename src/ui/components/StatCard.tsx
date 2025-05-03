"use client"

import type { ReactNode } from "react"
import "../styles/statcard.css"

interface StatCardProps {
  icon: ReactNode
  count: string | number
  label: string
  onClick?: () => void
}

const StatCard = ({ icon, count, label, onClick }: StatCardProps) => {
  return (
    <div className="stat-card" onClick={onClick}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-count">{count}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default StatCard
